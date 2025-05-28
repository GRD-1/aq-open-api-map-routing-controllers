import 'reflect-metadata';
import { 
  JsonController,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res
} from 'routing-controllers';
import {
  OpenAPI,
  ResponseSchema
} from 'routing-controllers-openapi';

// Export routing-controllers decorators with OpenApi prefix
export const OpenApiJsonController = JsonController;
export const OpenApiGet = Get;
export const OpenApiPost = Post;
export const OpenApiPut = Put;
export const OpenApiPatch = Patch;
export const OpenApiDelete = Delete;
export const OpenApiParam = Param;
export const OpenApiReq = Req;
export const OpenApiRes = Res;

// Export routing-controllers-openapi decorators
export { OpenAPI };

interface OpenApiResponseSchemaOptions {
  isArray?: boolean;
  alias?: string;  // Optional schema alias
}

export function OpenApiResponseSchema(responseDto: Function, options: OpenApiResponseSchemaOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store the response type for later use
    Reflect.defineMetadata('routing-controllers:response-type', responseDto, target, propertyKey);
    
    // Store the alias in metadata if provided
    if (options.alias) {
      Reflect.defineMetadata('openapi:response:alias', options.alias, target, propertyKey);
    }
    
    // Apply the original ResponseSchema decorator
    return ResponseSchema(responseDto, { isArray: options.isArray })(target, propertyKey, descriptor);
  };
}

export interface OpenApiControllerDescOptions {
  description: string;
  tags?: string[];
}

export function OpenApiControllerDesc(options: OpenApiControllerDescOptions) {
  return function (target: any) {
    Reflect.defineMetadata('openapi:controller:desc', options, target);
  };
}

export interface OpenApiPropertyOptions {
  description: string;
  example?: any;
}

export function OpenApiProperty(options: OpenApiPropertyOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    Reflect.defineMetadata('openapi:property', options, target, propertyKey);
  };
}

export function OpenApiAuth() {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    // Define security scheme
    const securityScheme = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      }
    };

    // Define security requirement
    const securityRequirement = [{ bearerAuth: [] }];

    if (propertyKey && descriptor) {
      // Method decorator
      const openApi = Reflect.getMetadata('openapi', target, propertyKey) || {};
      openApi.security = securityRequirement;
      Reflect.defineMetadata('openapi', openApi, target, propertyKey);
      return descriptor;
    } else {
      // Controller decorator
      const openApi = Reflect.getMetadata('openapi', target) || {};
      if (!openApi.components) {
        openApi.components = {};
      }
      if (!openApi.components.securitySchemes) {
        openApi.components.securitySchemes = securityScheme;
      }
      if (!openApi.security) {
        openApi.security = securityRequirement;
      }
      Reflect.defineMetadata('openapi', openApi, target);
      return target;
    }
  };
}

interface OpenApiBodyOptions {
  alias?: string;  // Optional schema alias
}

export function OpenApiBody(dtoClass: Function, options: OpenApiBodyOptions = {}) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // Store the request type for later use
    Reflect.defineMetadata('routing-controllers:request-type', dtoClass, target, propertyKey);
    
    // Store the alias in metadata if provided
    if (options.alias) {
      Reflect.defineMetadata('openapi:request:alias', options.alias, target, propertyKey);
    }
    
    // Apply the original Body decorator
    return Body()(target, propertyKey, parameterIndex);
  };
} 