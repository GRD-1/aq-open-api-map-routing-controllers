import {
  OpenAPIObject,
  ComponentsObject,
  SchemaObject,
  ReferenceObject,
} from "routing-controllers-openapi/node_modules/openapi3-ts/dist/model";

export type ControllerType = {
  new (...args: any[]): any;
  prototype: Record<string, any>;
};

export interface OpenAPIMapConfig {
  controllers: any[]; // Array of controller classes
  info: {
    title: string;
    version: string;
    description: string;
  };
  outputPath: string; // Path where the OpenAPI spec will be generated
}

export interface OpenAPISpec extends OpenAPIObject {
  tags: Array<{ name: string; description: string }>;
  paths: {
    [path: string]: {
      [method: string]: {
        operationId?: string;
        tags?: string[];
        security?: Array<{ [key: string]: string[] }>;
        responses?: {
          [key: string]: {
            description: string;
            content?: {
              [key: string]: {
                schema?: SchemaObject | ReferenceObject;
              };
            };
          };
        };
        [key: string]: any;
      };
    };
  };
  components?: ComponentsObject & {
    securitySchemes?: Record<string, any>;
  };
  security?: Array<{ [key: string]: string[] }>;
}

export interface OperationMetadata {
  responses?: {
    [key: string]: {
      description: string;
      content?: {
        [key: string]: {
          schema?: SchemaObject | ReferenceObject;
        };
      };
    };
  };
  security?: Array<{ [key: string]: string[] }>;
  [key: string]: any;
}

export interface RefObject {
  $ref: string;
}
