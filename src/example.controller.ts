import { BaseController, Controller, Get, Post, Put, Delete, Body, Param, Req, Res } from 'reef-framework';
import { Request, Response } from 'express';
import { ExampleService } from './example.service';

@Controller('/example')
export default class ExampleController extends BaseController {
  @Get('/')
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    const users = await ExampleService.getAllItems();
    return {
      status: 'success',
      data: users
    };
  }

  @Get('/:id')
  async getUserById(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    const user = await ExampleService.getItemById(id);
    return {
      status: 'success',
      data: user
    };
  }

  @Post('/')
  async createUser(@Req() req: Request, @Res() res: Response) {
    console.log('\nreq.body:', req.body);
    const user = await ExampleService.createItem(req.body);
    return {
      status: 'success',
      data: user
    };
  }

  @Put('/:id')
  async updateUser(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    const user = await ExampleService.updateItem(id, req.body);
    return {
      status: 'success',
      data: user
    };
  }

  @Delete('/:id')
  async deleteUser(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    const result = await ExampleService.deleteItem(id);
    return {
      status: 'success',
      data: result
    };
  }
} 