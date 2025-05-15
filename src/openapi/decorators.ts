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
export const OpenApiBody = Body;
export const OpenApiParam = Param;
export const OpenApiReq = Req;
export const OpenApiRes = Res;

// Export routing-controllers-openapi decorators
export { OpenAPI };
export const OpenApiResponseSchema = ResponseSchema;

export interface OpenApiControllerDescOptions {
  description: string;
  tags: string[];
}

export function OpenApiControllerDesc(options: OpenApiControllerDescOptions): ClassDecorator {
  return function (target: Function): any {
    // Store metadata on both the constructor and prototype
    Reflect.defineMetadata('openapi:controller:desc', options, target);
    Reflect.defineMetadata('openapi:controller:desc', options, target.prototype);
    
    // Log for debugging
    console.debug(`Defined controller metadata for ${target.name}:`, options);
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