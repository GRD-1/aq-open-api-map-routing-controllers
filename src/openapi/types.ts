import {
  OpenAPIObject,
  ComponentsObject,
  SchemaObject,
  ReferenceObject,
} from "routing-controllers-openapi/node_modules/openapi3-ts/dist/model";
import { DEFAULT_OPENAPI_SCHEMA_CONTENT } from "./configs/schemas";

export interface IClass {
  new (...args: any[]): any;
  prototype: Record<string, any>;
}

export interface IOpenAPIMapConfig {
  controllers: IClass[]; // Array of controller classes
  info: {
    title: string;
    version: string;
    description: string;
  };
  outputPath: string; // Path where the OpenAPI spec will be generated
}

export interface IOpenAPISpec extends OpenAPIObject {
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

export interface IOperationMetadata {
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

export interface IRefObject {
  $ref: string;
}

export interface IOpenApiResponseSchemaOptions {
  isArray?: boolean;
  aliases?: Record<string, string>; // Map of type names to their aliases (including main type and nested types)
}

export interface IOpenApiControllerDescOptions {
  description: string;
  tags?: string[];
}

export interface IOpenApiPropertyOptions {
  description: string;
  example?: any;
}

export interface IOpenApiBodyOptions {
  aliases?: Record<string, string>; // Map of type names to their aliases (including main type and nested types)
}

export type IOpenApiDefaultHttpStatusArgs =
  (typeof DEFAULT_OPENAPI_SCHEMA_CONTENT)[keyof typeof DEFAULT_OPENAPI_SCHEMA_CONTENT];
