import { BaseController, Controller, Post, Get } from 'reef-framework';
import { generateOpenAPISpec, writeOpenAPISpec } from './generate';
import * as fs from 'fs';
import * as path from 'path';

@Controller('/openapi')
export default class OpenAPIController extends BaseController {
  @Get('/json')
  async getOpenAPIJson(): Promise<any> {
    // Generate new spec
    const spec = generateOpenAPISpec();
    // Write to file
    writeOpenAPISpec(spec);
    return spec;
  }

  @Post('/generate')
  async generateOpenAPI(): Promise<{ status: string; message: string }> {
    const spec = generateOpenAPISpec();
    writeOpenAPISpec(spec);
    return {
      status: 'success',
      message: 'OpenAPI specification generated successfully'
    };
  }
} 