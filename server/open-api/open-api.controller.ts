import * as fs from 'fs'

import { BaseController, Controller, Get, Query, ResError } from 'reef-framework'

import { generateOpenAPISpec } from './generate-map'
import { mapConfigs } from './map-configs'
import { OPENAPI_CONFIG } from './config'

@Controller(OPENAPI_CONFIG.ROUTE)
export default class OpenAPIController extends BaseController {
  @Get(OPENAPI_CONFIG.METHOD_GET_JSON)
  async getOpenAPIJson(@Query('mapName') mapName: string = OPENAPI_CONFIG.DEFAULT_MAP_NAME): Promise<any> {
    if (!mapConfigs[mapName]) {
      throw new ResError(`Invalid map name: ${mapName}. Available maps: ${Object.keys(mapConfigs).join(', ')}`)
    }

    generateOpenAPISpec(mapConfigs[mapName])

    return JSON.parse(fs.readFileSync(mapConfigs[mapName].outputPath, 'utf-8'))
  }
}
