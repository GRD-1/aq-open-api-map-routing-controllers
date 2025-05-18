import { BaseController, Controller, Post } from 'reef-framework';
import { OpenApiJsonController, OpenApiPost, OpenApiControllerDesc, OpenAPI } from './decorators';
import { generateOpenAPISpec, writeOpenAPISpec } from './generate';
import { JSONSchema } from 'class-validator-jsonschema';

@OpenApiJsonController('/openapi')
@OpenApiControllerDesc({
  description: 'Controller for OpenAPI specification generation',
})
@Controller('/openapi')
export default class OpenAPIController extends BaseController {
  @Post('/generate')
  @OpenApiPost('/generate')
  @OpenAPI({
    summary: 'Generate OpenAPI specification',
    description: 'Generates OpenAPI specification using the running server instance'
  })
  @JSONSchema({
    description: 'Generate OpenAPI specification using the running server instance',
    example: { message: 'OpenAPI specification generated successfully' }
  })
  async generateOpenAPI(): Promise<{ status: string; message: string }> {
    const spec = generateOpenAPISpec();
    writeOpenAPISpec(spec);
    return {
      status: 'success',
      message: 'OpenAPI specification generated successfully'
    };
  }
} 