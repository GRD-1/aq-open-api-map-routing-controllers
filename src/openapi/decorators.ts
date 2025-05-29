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
  Res,
  HttpCode
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
  aliases?: Record<string, string>;  // Map of type names to their aliases (including main type and nested types)
}

export function OpenApiResponseSchema(responseDto: Function, options: OpenApiResponseSchemaOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store the response type for later use
    Reflect.defineMetadata('routing-controllers:response-type', responseDto, target, propertyKey);
    
    // Store aliases in metadata if provided
    if (options.aliases) {
      Reflect.defineMetadata('openapi:response:aliases', options.aliases, target, propertyKey);
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
  aliases?: Record<string, string>;  // Map of type names to their aliases (including main type and nested types)
}

export function OpenApiBody(dtoClass: Function, options: OpenApiBodyOptions = {}) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // Store the request type for later use
    Reflect.defineMetadata('routing-controllers:request-type', dtoClass, target, propertyKey);
    
    // Store aliases in metadata if provided
    if (options.aliases) {
      Reflect.defineMetadata('openapi:request:aliases', options.aliases, target, propertyKey);
    }
    
    // Apply the original Body decorator
    return Body()(target, propertyKey, parameterIndex);
  };
}

export function OpenApiDefaultHttpStatus(statusCode: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store the status code in metadata for OpenAPI
    const openApi = Reflect.getMetadata('openapi', target, propertyKey) || {};
    if (!openApi.responses) {
      openApi.responses = {};
    }
    
    // If the response doesn't exist for this status code, create it
    if (!openApi.responses[statusCode]) {
      openApi.responses[statusCode] = {
        description: getDefaultDescription(statusCode)
      };
    }
    
    Reflect.defineMetadata('openapi', openApi, target, propertyKey);
    
    // Apply the original HttpCode decorator
    return HttpCode(statusCode)(target, propertyKey, descriptor);
  };
}

function getDefaultDescription(statusCode: number): string {
  const descriptions: Record<number, string> = {
    200: 'OK - Request successful',
    201: 'Created - Resource created successfully',
    202: 'Accepted - Request accepted for processing',
    204: 'No Content - Request successful, no content to return',
    400: 'Bad Request - Invalid input data',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - Access denied',
    404: 'Not Found - Resource not found',
    409: 'Conflict - Resource conflict',
    422: 'Unprocessable Entity - Validation failed',
    500: 'Internal Server Error - Server error occurred',
    503: 'Service Unavailable - Server temporarily unavailable'
  };
  
  return descriptions[statusCode] || `Status code ${statusCode}`;
} 