import { Body, Delete, Get, Path, Post, Put, Query, Route } from 'tsoa';
import { IUser, IUserCreate, IUserUpdate } from '../model/User/IUser';
import { ICreateResponse } from '../types/ICreateResponse';
import { IIndexResponse } from '../types/IIndexQuery';
import { IUpdateResponse } from '../types/IUpdateResponse';
import { Crud } from '../utility/Crud';

const READ_COLUMNS = ['userId', 'familyName', 'givenName', 'email'];

/**
 * Un utilisateur de la plateforme.
 */
@Route("/user")
export class UserController {

  /**
   * Récupérer une page d'utilisateurs.
   */
  @Get()
  public async getUsers(
    /** La page (zéro-index) à récupérer */
    @Query() page?: string,    
    /** Le nombre d'éléments à récupérer (max 50) */
    @Query() limit?: string,    
  ): Promise<IIndexResponse<IUser>> {    
    return Crud.Index<IUser>({
      query: { page, limit }, 
      table: 'user', 
      columns: READ_COLUMNS
    });
  }

  /**
   * Créer un nouvel utilisateur
   */
  @Post()
  public async createUser(
    @Body() body: IUserCreate
  ): Promise<ICreateResponse> {
    return Crud.Create<IUserCreate>({
      body: body, 
      table: 'user'
    });
  }

  /**
   * Récupérer une utilisateur avec le ID passé dans le URL
   */
  @Get('{userId}')
  public async readUser(
    @Path() userId: number
  ): Promise<IUser> {
    return Crud.Read<IUser>({
      table: 'user', 
      idKey: 'userId', 
      idValue: userId, 
      columns: READ_COLUMNS
    });
  }

  /**
   * Mettre à jour un utilisateur avec le ID passé dans le URL
   */
  @Put('{userId}')
  public async updateUser(
    @Path() userId: number,
    @Body() body: IUserUpdate
  ): Promise<IUpdateResponse> {
    return Crud.Update<IUserUpdate>({
      body: body, 
      table: 'user', 
      idKey: 'userId', 
      idValue: userId
    });
  }
  
  /**
   * Supprimer un utilisateur
   */
  @Delete('{userId}')
  public async deleteUser(
    @Path() userId: number,
  ): Promise<IUpdateResponse> {
    return Crud.Delete({
      table: 'user', 
      idKey: 'userId', 
      idValue: userId
    });
  }

}