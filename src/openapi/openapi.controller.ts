import { BaseController, Controller, Post, Get } from 'reef-framework';
import { generateOpenAPISpec } from './generate';
import * as fs from 'fs';
import * as path from 'path';

@Controller('/openapi')
export default class OpenAPIController extends BaseController {
  @Get('/json')
  async getOpenAPIJson(): Promise<any> {
    // Generate new spec and write to file
    return generateOpenAPISpec();
  }

  @Post('/generate')
  async generateOpenAPI(): Promise<{ status: string; message: string }> {
    generateOpenAPISpec();
    return {
      status: 'success',
      message: 'OpenAPI specification generated successfully'
    };
  }
} 