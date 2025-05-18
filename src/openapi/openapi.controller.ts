import { BaseController, Controller, Post } from 'reef-framework';
import { generateOpenAPISpec, writeOpenAPISpec } from './generate';
import { JSONSchema } from 'class-validator-jsonschema';

@Controller('/openapi')
export default class OpenAPIController extends BaseController {
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