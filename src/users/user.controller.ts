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
  OpenApiAuth,
  OpenApiDefaultHttpStatus
} from '../openapi/decorators';
import { OpenApiControllerDesc } from '../openapi/decorators';
import { 
  CreateUserDtoReq, 
  UpdateUserDtoReq, 
  GetUsersDtoRes, 
  GetUsersDtoReq, 
  CreateUserDtoRes,
  getAllUsersDescription,
  getUserByIdDescription,
  createUserDescription
} from './dto';
import { 
  CreateUsersBulkDtoReq, 
  CreateUsersBulkDtoRes,
  createUsersBulkDescription 
} from './dto/create-users.dto';
import { 
  LoginRequestDto, 
  LoginResponseDto,
  loginDescription 
} from './dto/login.dto';
import { 
  updateUserDescription,
  patchUserDescription 
} from './dto/update-user.dto';
import { BaseController, Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, Res, Query } from 'reef-framework';
import { ConflictError, ValidationError, ApiError, NotFoundError, UnauthorizedError } from '../errors/api.error';
import { Auth } from '../decorators/auth.decorator';
import { JsonController, OnUndefined, HttpCode } from 'routing-controllers';
import { OpenAPI as RoutingOpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { User } from '../database/models/user.model';

@OpenApiAuth()
@OpenApiJsonController('/users')
@OpenApiControllerDesc({
  description: 'Controller for managing user accounts. Provides full CRUD operations',
  tags: ['Users']
})
@Controller('/users')
export default class UsersController extends BaseController {
  @Get('/')
  @Auth()
  @OpenApiGet('/')
  @OpenAPI(getAllUsersDescription)
  @OpenApiAuth()
  @OpenApiResponseSchema(GetUsersDtoRes, { isArray: true, aliases: { 'GetUsersDtoRes': 'GetUsersResAlias' }})
  async getAllUsers(
    @Req() req: Request, 
    @Res() res: Response,
    @Query() name?: string,
    @Query() email?: string
  ) {
    const users = await UserService.getAllItems({ name, email });

    return {
      status: 'success',
      data: users
    };
  }

  @Get('/:id')
  @Auth()
  @OpenApiGet('/:id')
  @OpenAPI(getUserByIdDescription)
  @OpenApiAuth()
  @OpenApiResponseSchema(GetUsersDtoRes, { 
    aliases: {
      'GetUsersDtoRes': 'GetUserByIdResAlias'
    }
  })
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
  @OpenAPI(createUserDescription)
  @OpenApiAuth()
  @OpenApiDefaultHttpStatus(201)
  @OpenApiResponseSchema(CreateUserDtoRes, { aliases: { 'CreateUserDtoRes': 'PostUserResAlias' } })
  async createUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body() email: string,
    @Body() password_hash: string,
    @Body() name: string,
    @OpenApiBody(CreateUserDtoReq, { 
      aliases: {
        'CreateUserDtoReq': 'PostUserReqAlias'
      }
    }) _: CreateUserDtoReq
  ) {
    try {
      const user = await UserService.createItem({ email, password_hash, name });
      return {
        status: 'success',
        data: user
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        res.status(409).json({
          status: 'error',
          message: error.message
        });
        return;
      }
      if (error instanceof ValidationError) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to create user'
      });
      return;
    }
  }

  @Post('/bulk')
  @Auth()
  @OpenApiPost('/bulk')
  @OpenAPI(createUsersBulkDescription)
  @OpenApiAuth()
  @OpenApiDefaultHttpStatus(201)
  @OpenApiResponseSchema(CreateUsersBulkDtoRes, { 
    aliases: {
      'CreateUsersBulkDtoRes': 'PostUsersBulkResAlias',
      'ExtraFields': 'ExtraFieldsAlias',
      'SuperExtraFields': 'SuperExtraFieldsAlias',
      'SuperPuperExtraFields': 'SuperPuperExtraFieldsAlias'
    }
  })
  async createUsers(
    @Req() req: Request,
    @Res() res: Response,
    @Body() users: CreateUsersBulkDtoReq["users"],
    @OpenApiBody(CreateUsersBulkDtoReq, { 
      aliases: {
        'CreateUsersBulkDtoReq': 'PostUsersBulkReqAlias',
        'CreateUserDtoReq': 'PostUserReqAlias'
      }
    }) _: CreateUsersBulkDtoReq
  ) {
    try {
      const createdUsers = await UserService.createBulkItems(users);
      return {
        status: 'success',
        data: createdUsers
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to create users'
      });
      return;
    }
  }

  @Put('/:id')
  @Auth()
  @OpenApiPut('/:id')
  @OpenAPI(updateUserDescription)
  @OpenApiAuth()
  @OpenApiResponseSchema(GetUsersDtoRes, { 
    aliases: {
      'GetUsersDtoRes': 'PutUserResAlias'
    }
  })
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
  @OpenAPI(patchUserDescription)
  @OpenApiAuth()
  @OpenApiResponseSchema(GetUsersDtoRes, { 
    aliases: {
      'GetUsersDtoRes': 'PatchUserResAlias'
    }
  })
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
  @OpenApiResponseSchema(GetUsersDtoRes, { 
    aliases: {
      'GetUsersDtoRes': 'DeleteUserResAlias'
    }
  })
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
  @OpenAPI(loginDescription)
  @OpenApiDefaultHttpStatus(200)
  @OpenApiResponseSchema(LoginResponseDto, { 
    aliases: {
      'LoginResponseDto': 'PostUserLoginResAlias'
    }
  })
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
      if (error instanceof NotFoundError) {
        throw new ApiError(404, 'User not found');
      }
      if (error instanceof UnauthorizedError) {
        throw new ApiError(401, 'Invalid credentials');
      }
      throw new ApiError(500, 'Failed to login', error);
    }
  }
} 