import { Request, Response } from 'express';
import { BaseController, Controller, Get, Req, Res, Param } from 'reef-framework';
import { 
  GetCustomersDtoRes, 
  GetCustomerByIdDtoRes, 
  GetCustomerRequisitesDtoRes,
  getCustomerByIdDescription,
} from './dto';
import { OpenApiControllerDesc, OpenApiGet, OpenApiJsonController } from '../open-api/decorators';
import { OpenAPI, OpenApiResponseSchema } from '../open-api/decorators';

@OpenApiJsonController('/customers')
@OpenApiControllerDesc({
  description: 'Controller for managing user accounts. Provides full CRUD operations',
  tags: ['Customers']
})
@Controller('/customers')
export default class CustomersController extends BaseController {
  @Get('/')
  @OpenApiGet('/')
  @OpenApiResponseSchema(GetCustomersDtoRes, { 
    isArray: true,
    aliases: {
      'GetCustomersDtoRes': 'GetCustomersResAlias',
      'NestedCustomerFields': 'NestedCustomerFieldsAlias'
    }
  })
  async getAllCustomers(@Req() req: Request, @Res() res: Response) {
    const customers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return {
      status: 'success',
      data: customers
    };
  }

  @OpenApiGet('/:id')
  @OpenAPI(getCustomerByIdDescription)
  @OpenApiResponseSchema(GetCustomerByIdDtoRes, { 
    aliases: {
      'GetCustomerByIdDtoRes': 'GetCustomerByIdResAlias'
    }
  })
  @Get('/:id')
  async getCustomerById(@Param('id') id: number, @Req() req: Request, @Res() res: Response) {
    const customer = {
      id: id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      created_at: new Date(),
      updated_at: new Date()
    };

    return {
      status: 'success',
      data: customer
    };
  }

  @Get('/:id/requisites')
  @OpenApiGet('/:id/requisites')
  @OpenApiResponseSchema(GetCustomerRequisitesDtoRes, { 
    aliases: {
      'GetCustomerRequisitesDtoRes': 'GetCustomerRequisitesResAlias'
    }
  })
  async getCustomerRequisites(@Param('id') id: number, @Req() req: Request, @Res() res: Response) {
    const requisites = {
      bank_name: 'Example Bank',
      bank_account: '1234567890',
      bank_code: 'EXB123',
      tax_id: 'TAX123456',
      company_name: 'Example Company Ltd',
      company_address: '123 Business St, City, Country',
      customer_id: id
    };

    return {
      status: 'success',
      data: requisites
    };
  }
} 