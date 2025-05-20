import { BaseController, Controller, Get, Query } from 'reef-framework';
import { generateOpenAPISpec } from './generate';
import { mapConfigs } from './configs';
import { Request, Response, NextFunction } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';

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
  static setupSwaggerUI(app: any) {
    // Serve Swagger UI static files
    app.use('/api/v1/openapi/ui', swaggerUi.serve);

    // Handle Swagger UI HTML
    app.get('/api/v1/openapi/ui', async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Get the mapName from query parameters
        const mapName = req.query.mapName as string || 'all';

        if (!mapConfigs[mapName]) {
          throw new Error(`Invalid map name: ${mapName}. Available maps: ${Object.keys(mapConfigs).join(', ')}`);
        }

        // Generate new spec
        await generateOpenAPISpec(mapConfigs[mapName]);
        const spec = JSON.parse(fs.readFileSync(mapConfigs[mapName].outputPath, 'utf-8'));

        // Setup Swagger UI with the generated spec
        const swaggerUiHandler = swaggerUi.setup(spec, {
          swaggerOptions: {
            persistAuthorization: true
          }
        });

        // Call the Swagger UI handler
        swaggerUiHandler(req, res, next);
      } catch (error) {
        next(error);
      }
    });
  }

  @Get('/json')
  async getOpenAPIJson(@Query('mapName') mapName: string = 'all'): Promise<any> {
    if (!mapConfigs[mapName]) {
      throw new Error(`Invalid map name: ${mapName}. Available maps: ${Object.keys(mapConfigs).join(', ')}`);
    }

    // Generate new spec
    await generateOpenAPISpec(mapConfigs[mapName]);

    // Read and return the generated spec
    return JSON.parse(fs.readFileSync(mapConfigs[mapName].outputPath, 'utf-8'));
  }
} 