import { Request, Response } from 'express';
import UserService from './user.service';
import {
  OpenApiJsonController,
  OpenApiGet,
  OpenApiPost,
  OpenApiPut,
  OpenApiDelete,
  OpenApiBody,
  OpenApiParam,
  OpenApiReq,
  OpenApiRes,
  OpenAPI,
  OpenApiResponseSchema
} from './decorators/openapi.decorators';
import { CreateUserDtoReq, UpdateUserDtoReq, GetUsersDtoRes, GetUsersDtoReq } from './dto';

import { BaseController, Controller } from 'reef-framework';

@OpenApiJsonController('/users')
@Controller('/users')
export default class UsersController extends BaseController {
  @OpenApiGet('/')
  @OpenAPI({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system'
  })
  @OpenApiResponseSchema(GetUsersDtoRes, { isArray: true })
  async getAllUsers(@OpenApiReq() req: Request, @OpenApiRes() res: Response) {
    const users = await UserService.getAllItems();
    return {
      status: 'success',
      data: users
    };
  }

  @OpenApiGet('/:id')
  @OpenAPI({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their ID',
    parameters: [{
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'number' }
    }]
  })
  @OpenApiResponseSchema(GetUsersDtoRes)
  async getUserById(@OpenApiRes() res: Response, @OpenApiParam('id') id: string) {
    if (!id.match(/^\d+$/)) {
      res.status(404).json({
        status: 'error',
        message: 'Not Found'
      });
      return;
    }

    try {
      const user = await UserService.getItemById(parseInt(id, 10));
      return {
        status: 'success',
        data: user
      };
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
  }

  @OpenApiPost('/')
  @OpenAPI({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided data'
  })
  @OpenApiResponseSchema(GetUsersDtoRes)
  async createUser(@OpenApiReq() req: Request, @OpenApiRes() res: Response, @OpenApiBody() userData: CreateUserDtoReq) {
    console.log('\nreq.body:', req.body);
    const user = await UserService.createItem(userData);
    return {
      status: 'success',
      data: user
    };
  }

  @OpenApiPut('/:id')
  @OpenAPI({
    summary: 'Update a user',
    description: 'Updates an existing user with the provided data',
    parameters: [{
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'number' }
    }]
  })
  @OpenApiResponseSchema(GetUsersDtoRes)
  async updateUser(@OpenApiReq() req: Request, @OpenApiRes() res: Response, @OpenApiParam('id') id: string, @OpenApiBody() userData: UpdateUserDtoReq) {
    if (!id.match(/^\d+$/)) {
      res.status(404).json({
        status: 'error',
        message: 'Not Found'
      });
      return;
    }

    try {
      const user = await UserService.updateItem(parseInt(id, 10), userData);
      return {
        status: 'success',
        data: user
      };
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
  }

  @OpenApiDelete('/:id')
  @OpenAPI({
    summary: 'Delete a user',
    description: 'Deletes an existing user',
    parameters: [{
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'number' }
    }]
  })
  @OpenApiResponseSchema(GetUsersDtoRes)
  async deleteUser(@OpenApiReq() req: Request, @OpenApiRes() res: Response, @OpenApiParam('id') id: string) {
    if (!id.match(/^\d+$/)) {
      res.status(404).json({
        status: 'error',
        message: 'Not Found'
      });
      return;
    }

    try {
      const result = await UserService.deleteItem(parseInt(id, 10));
      return {
        status: 'success',
        data: result
      };
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
  }
} 