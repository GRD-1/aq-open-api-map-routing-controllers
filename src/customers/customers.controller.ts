import { Request, Response } from 'express';
import { BaseController, Controller, Get, Req, Res, Param } from 'reef-framework';
import { GetCustomersDtoRes, GetCustomerByIdDtoRes, GetCustomerRequisitesDtoRes } from './dto';
import { OpenApiControllerDesc, OpenApiGet, OpenApiJsonController } from '../openapi/decorators';
import { OpenApiResponseSchema } from '../openapi/decorators';

@OpenApiJsonController('/customers')
@OpenApiControllerDesc({
  description: 'Controller for managing user accounts. Provides full CRUD operations',
  tags: ['Customers']
})
@Controller('/customers')
export default class CustomersController extends BaseController {
  @Get('/')
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

  @OpenApiGet('/')
  @OpenApiResponseSchema(GetCustomerByIdDtoRes)
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