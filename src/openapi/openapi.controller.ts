import { BaseController, Controller, Post, Get, Query } from 'reef-framework';
import { generateOpenAPISpec } from './generate';
import { mapConfigs } from './configs';
import * as fs from 'fs';
import * as path from 'path';

@Controller('/openapi')
export default class OpenAPIController extends BaseController {
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