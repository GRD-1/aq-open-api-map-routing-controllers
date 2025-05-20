import { BaseController, Controller, Post, Get, Query } from 'reef-framework';
import { generateOpenAPISpec } from './generate';
import { mapConfigs } from './configs';
import { Request, Response, NextFunction } from 'express';
import * as swaggerUi from 'swagger-ui-express';

// Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      swaggerDoc?: any;
    }
  }
}

@Controller('/openapi')
export default class OpenAPIController extends BaseController {
  private static swaggerMiddleware = [
    (req: Request, _res: Response, next: NextFunction) => {
      req.swaggerDoc = null;
      next();
    },
    ...swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerOptions: {
        url: '/api/v1/openapi/json',
        persistAuthorization: true
      }
    })
  ];

  static setupSwaggerUI(app: any) {
    app.use('/api/v1/openapi/ui', OpenAPIController.swaggerMiddleware);
  }

  @Get('/json')
  async getOpenAPIJson(@Query('mapName') mapName: string = 'all'): Promise<any> {
    if (!mapConfigs[mapName]) {
      throw new Error(`Invalid map name: ${mapName}. Available maps: ${Object.keys(mapConfigs).join(', ')}`);
    }

    // Generate new spec using the selected configuration
    return generateOpenAPISpec(mapConfigs[mapName]);
  }

  @Post('/generate')
  async generateOpenAPI(@Query('mapName') mapName: string = 'all'): Promise<{ status: string; message: string }> {
    if (!mapConfigs[mapName]) {
      throw new Error(`Invalid map name: ${mapName}. Available maps: ${Object.keys(mapConfigs).join(', ')}`);
    }

    // Generate new spec using the selected configuration
    generateOpenAPISpec(mapConfigs[mapName]);
    return {
      status: 'success',
      message: `OpenAPI specification for "${mapName}" map generated successfully`
    };
  }
} 