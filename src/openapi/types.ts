import { OpenAPIObject } from 'routing-controllers-openapi/node_modules/openapi3-ts/dist/model/OpenApi';

export interface OpenAPIMapConfig {
  controllers: any[];  // Array of controller classes
  info: {
    title: string;
    version: string;
    description: string;
  };
  outputPath: string;  // Path where the OpenAPI spec will be generated
} 