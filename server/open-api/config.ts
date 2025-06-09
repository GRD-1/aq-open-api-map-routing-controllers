import type { SecuritySchemeObject } from 'openapi3-ts/oas30'

export enum OPENAPI_CONFIG {
  ROUTE = 'openapi',
  METHOD_GET_UI = '/ui',
  METHOD_GET_JSON = '/json',
  OUTPUT_FOLDER = '/public/open-api',
  DEFAULT_MAP_NAME = 'all',
}

export const OPENAPI_PATH_GET_UI = `${OPENAPI_CONFIG.ROUTE}${OPENAPI_CONFIG.METHOD_GET_UI}`

export const OPENAPI_PATH_GET_JSON = `${OPENAPI_CONFIG.ROUTE}${OPENAPI_CONFIG.METHOD_GET_JSON}`

export const ROUTING_CONTROLLER_OPTIONS = {
  routePrefix: '',
  defaults: {
    paramOptions: {
      required: true,
    },
  },
  classTransformer: true,
  validation: true,
  development: false,
}

export const ROUTING_CONTROLLER_SECURITY_SCHEMAS = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter your JWT token in the format: Bearer <token>',
  } as SecuritySchemeObject,
}
