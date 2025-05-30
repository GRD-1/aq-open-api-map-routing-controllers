import {Request, Response} from 'express';
import UserService from './user.service';
import {
  OpenAPI,
  OpenApiAuth,
  OpenApiBody,
  OpenApiControllerDesc,
  OpenApiDefaultHttpStatus,
  OpenApiDelete,
  OpenApiGet,
  OpenApiJsonController,
  OpenApiPatch,
  OpenApiPost,
  OpenApiPut,
  OpenApiQuery,
  OpenApiResponse,
  OpenApiResponseSchema
} from '../openapi/decorators';
import {
  createUserDescription,
  CreateUserDtoReq,
  CreateUserDtoRes,
  getAllUsersDescription,
  getUserByIdDescription,
  GetUsersDtoRes,
  GetUsersQueryDto,
  UpdateUserDtoReq
} from './dto';
import {createUsersBulkDescription, CreateUsersBulkDtoReq, CreateUsersBulkDtoRes} from './dto/create-users.dto';
import {loginDescription, LoginRequestDto, LoginResponseDto} from './dto/login.dto';
import {patchUserDescription, updateUserDescription} from './dto/update-user.dto';
import {BaseController, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res} from 'reef-framework';
import {ApiError, ConflictError, NotFoundError, UnauthorizedError, ValidationError} from '../errors/api.error';
import {Auth} from '../decorators/auth.decorator';
import {DEFAULT_OPENAPI_SCHEMA_CONTENT} from "../openapi/configs/schemas";

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
  @OpenApiResponse(DEFAULT_OPENAPI_SCHEMA_CONTENT.NOT_AUTHORISED_401)
  async getAllUsers(
    @OpenApiQuery() _: GetUsersQueryDto,
    @Req() req: Request, 
    @Res() res: Response,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('ravoly') ravoly?: string
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
  @OpenApiDefaultHttpStatus(DEFAULT_OPENAPI_SCHEMA_CONTENT.CREATED_201)
  @OpenApiResponseSchema(CreateUserDtoRes)
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
  @OpenApiDefaultHttpStatus(DEFAULT_OPENAPI_SCHEMA_CONTENT.CREATED_201)
  @OpenApiResponseSchema(CreateUsersBulkDtoRes)
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
  @OpenApiDefaultHttpStatus(DEFAULT_OPENAPI_SCHEMA_CONTENT.DELETED_204)
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