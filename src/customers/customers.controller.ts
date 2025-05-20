import { Request, Response } from 'express';
import { BaseController, Controller, Get, Req, Res } from 'reef-framework';
import { GetCustomersDtoRes } from './dto';

@Controller('/customers')
export default class CustomersController extends BaseController {
  @Get('/')
  async getAllCustomers(@Req() req: Request, @Res() res: Response) {
    // Mock data for demonstration
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
} 