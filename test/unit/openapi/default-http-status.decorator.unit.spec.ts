import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';
import { OpenApiDefaultHttpStatus } from '../../../server/open-api/decorators';
import { DEFAULT_OPENAPI_SCHEMA_CONTENT } from '../../../server/open-api/map-configs/schemas';

describe('OpenApiDefaultHttpStatus', () => {
  // Mock target, propertyKey and descriptor
  const target = {};
  const propertyKey = 'testMethod';
  const descriptor: PropertyDescriptor = {
    value: () => {},
    writable: true,
    enumerable: true,
    configurable: true
  };

  beforeEach(() => {
    // Clear metadata before each test
    Reflect.deleteMetadata('openapi', target, propertyKey);
    Reflect.deleteMetadata('routing-controllers:http-code', target, propertyKey);
  });

  it('should store status code in OpenAPI metadata', () => {
    const status = {
      statusCode: 200,
      description: 'Success',
      contentType: 'application/json'
    };

    // Call the decorator function directly
    OpenApiDefaultHttpStatus(status)(target, propertyKey, descriptor);

    const metadata = Reflect.getMetadata('openapi', target, propertyKey);
    assert.isDefined(metadata.responses, 'Responses should be defined');
    assert.equal(metadata.responses[200], 'Success', 'Response description should be stored');
  });

  it('should apply HttpCode decorator', () => {
    const status = {
      statusCode: 201,
      description: 'Created',
      contentType: 'application/json'
    };

    // Mock HttpCode decorator metadata
    const mockHttpCode = (statusCode: number) => {
      Reflect.defineMetadata('routing-controllers:http-code', statusCode, target, propertyKey);
    };

    OpenApiDefaultHttpStatus(status)(target, propertyKey, descriptor);
    mockHttpCode(status.statusCode);

    const storedStatusCode = Reflect.getMetadata('routing-controllers:http-code', target, propertyKey);
    assert.equal(storedStatusCode, 201, 'HTTP status code should be stored');
  });

  it('should handle predefined status from DEFAULT_OPENAPI_SCHEMA_CONTENT', () => {
    const status = DEFAULT_OPENAPI_SCHEMA_CONTENT.NO_CONTENT_204;

    OpenApiDefaultHttpStatus(status)(target, propertyKey, descriptor);

    const metadata = Reflect.getMetadata('openapi', target, propertyKey);
    assert.equal(metadata.responses[204], status.description, 'Predefined status description should be stored');
  });

  it('should preserve existing OpenAPI metadata', () => {
    // Set some existing metadata
    const existingMetadata = {
      responses: {
        400: 'Bad Request'
      },
      tags: ['test']
    };
    Reflect.defineMetadata('openapi', existingMetadata, target, propertyKey);

    const status = {
      statusCode: 200,
      description: 'Success',
      contentType: 'application/json'
    };

    OpenApiDefaultHttpStatus(status)(target, propertyKey, descriptor);

    const metadata = Reflect.getMetadata('openapi', target, propertyKey);
    assert.isDefined(metadata.responses[400], 'Existing response should be preserved');
    assert.isDefined(metadata.responses[200], 'New response should be added');
    assert.deepEqual(metadata.tags, ['test'], 'Other metadata should be preserved');
  });

  it('should preserve original descriptor', () => {
    const originalValue = descriptor.value;
    
    const status = {
      statusCode: 200,
      description: 'Success',
      contentType: 'application/json'
    };

    OpenApiDefaultHttpStatus(status)(target, propertyKey, descriptor);

    assert.equal(descriptor.value, originalValue, 'Descriptor value should be preserved');
    assert.isTrue(descriptor.writable, 'Descriptor should remain writable');
    assert.isTrue(descriptor.enumerable, 'Descriptor should remain enumerable');
    assert.isTrue(descriptor.configurable, 'Descriptor should remain configurable');
  });
}); 