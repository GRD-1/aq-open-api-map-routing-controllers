import { Request, Response } from 'express';
import {
  OpenApiJsonController,
  OpenApiGet,
  OpenApiResponseSchema,
  OpenAPI,
  OpenApiAuth,
} from '../openapi/decorators';
import { OpenApiControllerDesc } from '../openapi/decorators';
import { GetThingsDtoRes, getAllThingsDescription } from './dto';
import { BaseController, Controller, Get, Req, Res } from 'reef-framework';

@OpenApiJsonController('/things')
@OpenApiControllerDesc({
  description: 'Controller for managing things. Provides basic operations',
  tags: ['Things']
})
@Controller('/things')
export default class ThingsController extends BaseController {
  @Get('/')
  @OpenApiGet('/')
  @OpenAPI(getAllThingsDescription)
  @OpenApiResponseSchema(GetThingsDtoRes, { isArray: true })
  async getAllThings(@Req() req: Request, @Res() res: Response) {
    const things = [
      {
        id: 1,
        name: 'Thing 1',
        description: 'This is thing 1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Thing 2',
        description: 'This is thing 2',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return {
      status: 'success',
      data: things
    };
  }
} 