import { ReferenceObject, SchemaObject } from 'routing-controllers-openapi/node_modules/openapi3-ts/dist/model'

export enum DEFAULT_OPENAPI_SCHEMA {
  INTERNAL_SERVER_ERROR = 'InternalServerError',
  NO_CONTENT = 'NoContent',
  NOT_FOUND = 'NotFound',
  NOT_AUTHORISED = 'NotAuthorised',
  NOT_PROCESSABLE = 'NotProcessable',
  NOT_PROCESSABLE_IDS = 'NotProcessableIds',
  NOT_PROCESSABLE_FACILITY = 'NotProcessableFacility',
}

export const DEFAULT_OPENAPI_SCHEMAS: Record<string, SchemaObject | ReferenceObject> = {
  [DEFAULT_OPENAPI_SCHEMA.INTERNAL_SERVER_ERROR]: {
    type: 'object',
    properties: { message: { type: 'string', example: 'Something went wrong' } },
  },
  [DEFAULT_OPENAPI_SCHEMA.NOT_FOUND]: {
    type: 'object',
    properties: { message: { type: 'string', example: 'Resource not found' } },
  },
  [DEFAULT_OPENAPI_SCHEMA.NOT_AUTHORISED]: {
    type: 'object',
    properties: { message: { type: 'string', example: 'Not authorized' } },
  },
  [DEFAULT_OPENAPI_SCHEMA.NOT_PROCESSABLE]: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Not processable' },
      success: { type: 'boolean', example: false },
    },
  },
  [DEFAULT_OPENAPI_SCHEMA.NOT_PROCESSABLE_IDS]: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Not processable' },
      success: { type: 'boolean', example: false },
      invalidIds: {
        type: 'array',
        example: '["aee349fd-28e4-450d-9e20-af64d9c0d813", "bdd8f526-4c6a-4ea5-b740-4762aac04697"]',
      },
    },
  },
  [DEFAULT_OPENAPI_SCHEMA.NOT_PROCESSABLE_FACILITY]: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Not processable' },
      success: { type: 'boolean', example: false },
      invalidIds: {
        type: 'array',
        example: '["aee349fd-28e4-450d-9e20-af64d9c0d813", "bdd8f526-4c6a-4ea5-b740-4762aac04697"]',
      },
    },
  },
}

export const DEFAULT_OPENAPI_SCHEMA_CONTENT = {
  INTERNAL_SERVER_ERROR_500: {
    schema: DEFAULT_OPENAPI_SCHEMA.INTERNAL_SERVER_ERROR,
    statusCode: 500,
    description: 'Internal server error',
    contentType: 'application/json',
  },
  NO_CONTENT_204: {
    statusCode: 204,
    description: 'No content',
    contentType: 'application/json',
  },
  NOT_FOUND_404: {
    schema: DEFAULT_OPENAPI_SCHEMA.NOT_FOUND,
    statusCode: 404,
    description: 'Resource not found',
    contentType: 'application/json',
  },
  NOT_AUTHORISED_401: {
    schema: DEFAULT_OPENAPI_SCHEMA.NOT_AUTHORISED,
    statusCode: 401,
    description: 'Not authorised',
    contentType: 'application/json',
  },
  NOT_PROCESSABLE_422: {
    schema: DEFAULT_OPENAPI_SCHEMA.NOT_PROCESSABLE,
    statusCode: 422,
    description: 'Not processable',
    contentType: 'application/json',
  },
  NOT_PROCESSABLE_422_INVALID_IDS: {
    schema: DEFAULT_OPENAPI_SCHEMA.NOT_PROCESSABLE_IDS,
    statusCode: 422,
    description: 'Not processable',
    contentType: 'application/json',
  },
  NOT_PROCESSABLE_422_INCORRECT_FACILITY: {
    schema: DEFAULT_OPENAPI_SCHEMA.NOT_PROCESSABLE_FACILITY,
    statusCode: 422,
    description: 'Not processable',
    contentType: 'application/json',
  },
}
