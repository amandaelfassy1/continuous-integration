import { Router } from "express";
import { Get, Query, Route } from 'tsoa';
import { IUserRO } from "../model/User/IUser";
import { IAccessToken } from "../types/auth/IAccessToken";
import { Crud } from "../utility/Crud";
import { Email } from "../utility/Email";
import { ApiError } from "../utility/Error/ApiError";
import { ErrorCode } from "../utility/Error/ErrorCode";
import { JWT } from "../utility/JWT";


export const ISSUER = "api-auth";
export const MAGIC_AUD = "api-magic"
export const ACCESS_AUD = "api-access";
export const RENEW_AUD = "api-renew";

const router = Router({ mergeParams: true });

@Route("/auth")
export class AuthController {
  
  @Get("/magic")
  public async sendMagicLink(  
    @Query() email: string,        
  ): Promise<{ ok: boolean}> {    
    if (!email) {
      throw new ApiError(ErrorCode.BadRequest, 'auth/missing-email', "Email is missing in magic link request.");
    }

    // Vérifier si on a un utilisateur avec l'adresse email dans notre base
    const user = await Crud.Read<IUserRO>({
      table: 'user',
      idKey: 'email',
      idValue: email,
      columns: ['userId', 'email']
    });

   
    // Create the new JWT
    const jwt = new JWT();
    const encoded = await jwt.create({
      userId: user.userId,
    }, {
      expiresIn: '30 minutes',
      audience: MAGIC_AUD,
      issuer: ISSUER
    }) as string;
    
    const emailer = new Email();

    const link = (process.env.FRONT_URL || 'http://localhost:' + (process.env.PORT || 5050)) + '/auth/login?jwt=' + encodeURIComponent(encoded);
    await emailer.sendMagicLink(email, link, 'Mon service');

    return {
      ok: true
    };
  }

  @Get("/login")
  public async loginFromMaginLink(  
    @Query() jwt: string,        
  ): Promise<{ 
    access: string;
    renew: string;
    redirectTo: string;
    message: string;
  }> {    
    
    if (!jwt) {
      throw new ApiError(ErrorCode.BadRequest, 'auth/missing-magic-link-token', "Token is missing in login request.");
    }

    const helper = new JWT();
    const decoded = await helper.decode(jwt, {
      issuer: ISSUER,
      audience: MAGIC_AUD,
    });

    if (!decoded.userId) {
      throw new ApiError(ErrorCode.Unauthorized, 'auth/invalid-magic-link-token', "userId was not found in the payload for token");
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await Crud.Read<IUserRO>({
      table: 'user',
      idKey: 'userId',
      idValue: decoded.userId,
      columns: ['userId']
    });

    let payload: IAccessToken = {
      userId: user.userId
    };
    

    const access = await helper.create(payload, {
      expiresIn: '12 hours',
      issuer: ISSUER,
      audience: ACCESS_AUD,
    }) as string;

    const renew = await helper.create(payload, {
      expiresIn: '1 week',
      issuer: ISSUER,
      audience: RENEW_AUD,
    }) as string;

    return {
      access: access,
      renew: renew,
      redirectTo: 'https://lien.vers.mon.front',
      message: 'Normalement ce endpoint va demander au navigateur de rediriger vers votre site ou ressource'
    };
  }

}

// TODO: Complétez les endpoints pour le renouvellement du `access token`. 
// - si le demandeur recoit une erreur de type 'expired', il devrait renvoyer son renew-token à un endpoint /auth/renew (par exemple)
// - si le renew-token est toujours valable, on peut re-emettre un access token

