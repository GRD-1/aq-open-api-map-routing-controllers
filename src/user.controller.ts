import { Request, Response } from 'express';
import UserService from './user.service';
import {
  OpenApiJsonController,
  OpenApiGet,
  OpenApiPost,
  OpenApiPut,
  OpenApiPatch,
  OpenApiDelete,
  OpenApiBody,
  OpenApiParam,
  OpenApiReq,
  OpenApiRes,
  OpenApiResponseSchema,
  OpenAPI,
  OpenApiAuth
} from './openapi/decorators';
import { OpenApiControllerDesc } from './openapi/decorators';
import { CreateUserDtoReq, UpdateUserDtoReq, GetUsersDtoRes, GetUsersDtoReq, CreateUserDtoRes } from './dto';
import { CreateUsersBulkDtoReq, CreateUsersBulkDtoRes } from './dto/create-users.dto';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { BaseController, Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, Res } from 'reef-framework';
import { ConflictError, ValidationError, ApiError, NotFoundError, UnauthorizedError } from './errors/api.error';
import { Auth } from './decorators/auth.decorator';

@OpenApiJsonController('/users')
@OpenApiControllerDesc({
  description: 'Controller for managing user accounts. Provides full CRUD operations LATEPIA',
  tags: ['Users']
})
@Controller('/users')
export default class UsersController extends BaseController {
  @Get('/')
  @Auth()
  @OpenApiGet('/')
  @OpenAPI({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system'
  })
  @OpenApiAuth()
  @OpenApiResponseSchema(GetUsersDtoRes, { isArray: true })
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    const users = await UserService.getAllItems();
    return {
      status: 'success',
      data: users
    };
  }

  @Get('/:id')
  @Auth()
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
  @OpenApiAuth()
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
  @Auth()
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
    }
  })
  @OpenApiAuth()
  @OpenApiResponseSchema(CreateUserDtoRes)
  async createUser(
    @Req() req: Request,
    @Res() res: Response,
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

  @Post('/bulk')
  @Auth()
  @OpenApiPost('/bulk')
  @OpenAPI({
    summary: 'Create multiple users',
    description: 'Creates multiple users in a single request',
    responses: {
      '400': {
        description: 'Bad Request - Invalid input data',
      },
      '403': {
        description: 'Forbidden',
      },
      '409': {
        description: 'Conflict - One or more users with these emails already exist',
      }
    }
  })
  @OpenApiAuth()
  @OpenApiResponseSchema(CreateUsersBulkDtoRes)
  async createUsers(
    @Req() req: Request,
    @Res() res: Response,
    @Body() users: CreateUsersBulkDtoReq["users"],
    @OpenApiBody() body: CreateUsersBulkDtoReq,
  ) {
    const createdUsers = await UserService.createBulkItems(users);
    return {
      status: 'success',
      data: createdUsers
    };
  }

  @Put('/:id')
  @Auth()
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
  @OpenApiAuth()
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

  @Patch('/:id')
  @Auth()
  @OpenApiPatch('/:id')
  @OpenAPI({
    summary: 'Partially update a user',
    description: 'Updates specific fields of an existing user',
    parameters: [{
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'number' }
    }]
  })
  @OpenApiAuth()
  @OpenApiResponseSchema(GetUsersDtoRes)
  async patchUser(
    @Param('id') id: string,
    @Body() userData: Partial<UpdateUserDtoReq>,
    @Req() req: Request,
    @Res() res: Response
  ) {
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
  @Auth()
  @OpenApiDelete('/:id')
  @OpenAPI({
    summary: 'Delete a user',
    description: 'Deletes an existing user',
  })
  @OpenApiAuth()
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

  @Post('/login')
  @OpenApiPost('/login')
  @OpenAPI({
    summary: 'Login user',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @OpenApiBody()
  @OpenApiResponseSchema(LoginResponseDto)
  async login(
    @Body() body: LoginRequestDto
  ) {
    try {
      const tokens = await UserService.login(body.email, body.password_hash);
      return {
        status: 'success',
        data: tokens
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to login', error);
    }
  }
} 