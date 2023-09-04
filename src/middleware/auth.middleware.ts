import { NextFunction, Request, Response } from "express";
import { ACCESS_AUD, ISSUER } from "../routes/AuthController";
import { IAccessToken } from "../types/auth/IAccessToken";
import { ApiError } from "../utility/Error/ApiError";
import { ErrorCode } from "../utility/Error/ErrorCode";
import { JWT } from "../utility/JWT";

export const JWTAuthHandler = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const authheader = request.headers.authorization || '';
    if (!authheader.startsWith('Bearer ')) {
      throw new ApiError(ErrorCode.Unauthorized, 'auth/missing-header', 'Missing authorization header with Bearer token');
    }

    const token = authheader.split('Bearer ')[1];
    console.log(authheader);


    const jwt = new JWT();
    let decoded : IAccessToken|undefined;
    try {
      decoded = await jwt.decode(token, {
        issuer: ISSUER,
        audience: ACCESS_AUD,
      });
      
    } catch (err: any) {
      if (err?.name === "TokenExpiredError") {
        console.log("Token was expired.");
        
        throw new ApiError(ErrorCode.TokenExpired, 'auth/access-token-expired', 'Access token expired. Try renew it with the renew token.');
      }
      console.log(err);
    }
    
    if (!decoded) {
      throw new ApiError(ErrorCode.Unauthorized, 'auth/invalid-access-token', "Access token could not be decoded");
    }

    if (!decoded.userId) {
      throw new ApiError(ErrorCode.Unauthorized, 'auth/invalid-access-token', "userId was not found in the payload");
    }

    // Validé, stocker le userId sur la réponse pour utilisation plus tard
    response.locals.userId = decoded.userId;

    next();

  } catch (err) {
    next(err)
  }
  
}
