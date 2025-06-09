import 'reflect-metadata'
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
  HttpCode,
  QueryParams,
} from 'routing-controllers'
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi'

import {
  IClass,
  IOpenApiResponseSchemaOptions,
  IOpenApiControllerDescOptions,
  IOpenApiPropertyOptions,
  IOpenApiBodyOptions,
  IOpenApiDefaultHttpStatusArgs,
} from './types'

export const OpenApiJsonController = JsonController
export const OpenApiGet = Get
export const OpenApiPost = Post
export const OpenApiPut = Put
export const OpenApiPatch = Patch
export const OpenApiDelete = Delete
export const OpenApiParam = Param
export const OpenApiReq = Req
export const OpenApiRes = Res
export const OpenApiQuery = QueryParams

export { OpenAPI }

export function OpenApiResponseSchema(responseDto: IClass, options: IOpenApiResponseSchemaOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('routing-controllers:response-type', responseDto, target, propertyKey)

    if (options.aliases) {
      Reflect.defineMetadata('openapi:response:aliases', options.aliases, target, propertyKey)
    }

    return ResponseSchema(responseDto, { isArray: options.isArray })(target, propertyKey, descriptor)
  }
}

export function OpenApiResponse(
  responseConfig: {
    schema?: string
    statusCode: number
    description: string
    contentType?: string
  },
  params?: { statusCode?: number; description?: string },
) {
  const { schema, statusCode, description, contentType = 'application/json' } = { ...responseConfig, ...params }

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingResponses = Reflect.getMetadata('openapi:responses', target, propertyKey) || []

    existingResponses.push({
      statusCode,
      description,
      schema,
      contentType,
    })

    Reflect.defineMetadata('openapi:responses', existingResponses, target, propertyKey)

    return descriptor
  }
}

export function OpenApiControllerDesc(options: IOpenApiControllerDescOptions) {
  return function (target: any) {
    Reflect.defineMetadata('openapi:controller:desc', options, target)
  }
}

export function OpenApiProperty(options: IOpenApiPropertyOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    Reflect.defineMetadata('openapi:property', options, target, propertyKey)
  }
}

export function OpenApiAuth() {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const securityScheme = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    }

    const securityRequirement = [{ bearerAuth: [] }]

    if (propertyKey && descriptor) {
      const openApi = Reflect.getMetadata('openapi', target, propertyKey) || {}
      openApi.security = securityRequirement
      Reflect.defineMetadata('openapi', openApi, target, propertyKey)
      return descriptor
    }

    const openApi = Reflect.getMetadata('openapi', target) || {}
    if (!openApi.components) {
      openApi.components = {}
    }
    if (!openApi.components.securitySchemes) {
      openApi.components.securitySchemes = securityScheme
    }
    if (!openApi.security) {
      openApi.security = securityRequirement
    }
    Reflect.defineMetadata('openapi', openApi, target)
    return target
  }
}

export function OpenApiBody(dtoClass: IClass, options: IOpenApiBodyOptions = {}) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata('routing-controllers:request-type', dtoClass, target, propertyKey)

    if (options.aliases) {
      Reflect.defineMetadata('openapi:request:aliases', options.aliases, target, propertyKey)
    }

    return Body()(target, propertyKey, parameterIndex)
  }
}

export function OpenApiDefaultHttpStatus(status: IOpenApiDefaultHttpStatusArgs) {
  const { statusCode, description } = status

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const openApi = Reflect.getMetadata('openapi', target, propertyKey) || {}
    if (!openApi.responses) {
      openApi.responses = {}
    }

    openApi.responses[statusCode] = description

    Reflect.defineMetadata('openapi', openApi, target, propertyKey)

    return HttpCode(statusCode)(target, propertyKey, descriptor)
  }
}
