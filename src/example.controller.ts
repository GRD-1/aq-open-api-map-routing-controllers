import { JsonController, Get, Post, Put, Delete, Body, Param, Req, Res } from 'routing-controllers';
import { Request, Response } from 'express';
import { ExampleService } from './example.service';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { CreateUserDtoReq, UpdateUserDtoReq, GetUsersDtoRes, GetUsersDtoReq } from './dto';

@JsonController('/users')
export default class UsersController {
  @Get('/')
  @OpenAPI({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system'
  })
  @ResponseSchema(GetUsersDtoRes, { isArray: true })
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    const users = await ExampleService.getAllItems();
    return {
      status: 'success',
      data: users
    };
  }

  @Get('/:id')
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
  @ResponseSchema(GetUsersDtoRes)
  async getUserById(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
    if (!id.match(/^\d+$/)) {
      res.status(404).json({
        status: 'error',
        message: 'Not Found'
      });
      return;
    }

    try {
      const user = await ExampleService.getItemById(parseInt(id, 10));
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
  @OpenAPI({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided data'
  })
  @ResponseSchema(GetUsersDtoRes)
  async createUser(@Req() req: Request, @Res() res: Response, @Body() userData: CreateUserDtoReq) {
    console.log('\nreq.body:', req.body);
    const user = await ExampleService.createItem(userData);
    return {
      status: 'success',
      data: user
    };
  }

  @Put('/:id')
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
  @ResponseSchema(GetUsersDtoRes)
  async updateUser(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Body() userData: UpdateUserDtoReq) {
    if (!id.match(/^\d+$/)) {
      res.status(404).json({
        status: 'error',
        message: 'Not Found'
      });
      return;
    }

    try {
      const user = await ExampleService.updateItem(parseInt(id, 10), userData);
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
  @ResponseSchema(GetUsersDtoRes)
  async deleteUser(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
    if (!id.match(/^\d+$/)) {
      res.status(404).json({
        status: 'error',
        message: 'Not Found'
      });
      return;
    }

    try {
      const result = await ExampleService.deleteItem(parseInt(id, 10));
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