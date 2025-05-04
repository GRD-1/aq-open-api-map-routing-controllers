import { BaseController, Controller, Get, Post, Put, Delete, Body, Param, Req, Res } from 'reef-framework';
import { Request, Response } from 'express';
import { ExampleService } from './example.service';
import { ApiError } from './errors/api.error';

@Controller('/example')
export default class ExampleController extends BaseController {
  private handleError(res: Response, error: any) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        details: error.details
      });
    }
    
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }

  @Get('/')
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await ExampleService.getAllItems();
      return res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  @Get('/:id')
  async getUserById(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    try {
      const user = await ExampleService.getItemById(id);
      return res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  @Post('/')
  async createUser(@Req() req: Request, @Res() res: Response, @Body() userData: any) {
    try {
      const user = await ExampleService.createItem(req.body);
      return res.status(201).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  @Put('/:id')
  async updateUser(@Req() req: Request, @Res() res: Response, @Param('id') id: number, @Body() userData: any) {
    try {
      const user = await ExampleService.updateItem(id, userData);
      return res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  @Delete('/:id')
  async deleteUser(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    try {
      const result = await ExampleService.deleteItem(id);
      return res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
} 