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
import { CreateUserDtoReq, UpdateUserDtoReq, GetUsersDtoRes, GetUsersDtoReq, CreateUserDtoRes } from './dto';
import { BaseController, Controller, Get, Post, Put, Delete, Body, Param, Req, Res } from 'reef-framework';

@OpenApiJsonController('/users')
@Controller('/users')
export default class UsersController extends BaseController {
  @Get('/')
  @OpenApiGet('/')
  @OpenAPI({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system'
  })
  @OpenApiResponseSchema(GetUsersDtoRes, { isArray: true })
  async getAllUsers(@Req() req: Request) {
    const users = await UserService.getAllItems();
    return {
      status: 'success',
      data: users
    };
  }

  @Get('/:id')
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
  async getUserById(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
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

  @Post('/')
  @OpenApiPost('/')
  @OpenAPI({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided data',
    responses: {
      '400': {
        description: 'Bad Request',
      },
      '403': {
        description: 'Forbidden',
      }
  }})
  @OpenApiResponseSchema(CreateUserDtoRes)
  async createUser(
    @Body() email: string, 
    @Body() password_hash: string, 
    @Body() name: string, 
    @OpenApiBody() body: CreateUserDtoReq,
  ) {

    const user = await UserService.createItem({ email, password_hash, name });
    return {
      status: 'success',
      data: user
    };
  }

  @Put('/:id')
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
  async updateUser(@Param('id') id: string, @Body() userData: UpdateUserDtoReq, @Req() req: Request, @Res() res: Response) {
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

  @Delete('/:id')
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
  async deleteUser(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
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