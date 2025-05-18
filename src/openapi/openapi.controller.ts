import { BaseController, Controller, Post, Get } from 'reef-framework';
import { generateOpenAPISpec, writeOpenAPISpec } from './generate';
import * as fs from 'fs';
import * as path from 'path';

@Controller('/openapi')
export default class OpenAPIController extends BaseController {
  @Get('/json')
  async getOpenAPIJson(): Promise<any> {
    const openapiPath = path.join(process.cwd(), 'openapi/openapi.json');
    try {
      const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
      return openapiSpec;
    } catch (error) {
      console.error('Failed to read OpenAPI spec:', error);
      throw new Error('Failed to read OpenAPI specification');
    }
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