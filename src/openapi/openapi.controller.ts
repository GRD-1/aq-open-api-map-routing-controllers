import { BaseController, Controller, Get, Query } from "reef-framework";
import { generateOpenAPISpec } from "./generate";
import { mapConfigs } from "./configs";
import * as fs from "fs";

@Controller("/openapi")
export default class OpenAPIController extends BaseController {
  @Get("/json")
  async getOpenAPIJson(
    @Query("mapName") mapName: string = "all"
  ): Promise<any> {
    if (!mapConfigs[mapName]) {
      throw new Error(
        `Invalid map name: ${mapName}. Available maps: ${Object.keys(mapConfigs).join(", ")}`
      );
    }

    // Generate new spec
    await generateOpenAPISpec(mapConfigs[mapName]);

    // Read and return the generated spec
    return JSON.parse(fs.readFileSync(mapConfigs[mapName].outputPath, "utf-8"));
  }
}
