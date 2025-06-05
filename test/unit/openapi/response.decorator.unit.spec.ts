import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';
import { OpenApiResponse } from '../../../src/openapi/decorators';

describe('OpenApiResponse', () => {
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
    Reflect.deleteMetadata('openapi:responses', target, propertyKey);
  });

  it('should store response metadata with default content type', () => {
    const responseConfig = {
      statusCode: 200,
      description: 'Success response',
      schema: 'SuccessSchema'
    };

    // Call the decorator function directly
    OpenApiResponse(responseConfig)(target, propertyKey, descriptor);

    const responses = Reflect.getMetadata('openapi:responses', target, propertyKey);
    assert.isArray(responses, 'Responses metadata should be an array');
    assert.equal(responses.length, 1, 'Should have one response');
    assert.deepEqual(responses[0], {
      statusCode: 200,
      description: 'Success response',
      schema: 'SuccessSchema',
      contentType: 'application/json'
    }, 'Response metadata should match configuration with default content type');
  });

  it('should handle custom content type', () => {
    const responseConfig = {
      statusCode: 400,
      description: 'Bad request',
      contentType: 'application/problem+json'
    };

    OpenApiResponse(responseConfig)(target, propertyKey, descriptor);

    const responses = Reflect.getMetadata('openapi:responses', target, propertyKey);
    assert.equal(responses[0].contentType, 'application/problem+json', 'Content type should match configuration');
  });

  it('should accumulate multiple responses', () => {
    const firstResponse = {
      statusCode: 200,
      description: 'Success'
    };

    const secondResponse = {
      statusCode: 404,
      description: 'Not found'
    };

    // Apply multiple response decorators
    OpenApiResponse(firstResponse)(target, propertyKey, descriptor);
    OpenApiResponse(secondResponse)(target, propertyKey, descriptor);

    const responses = Reflect.getMetadata('openapi:responses', target, propertyKey);
    assert.equal(responses.length, 2, 'Should have two responses');
    assert.equal(responses[0].statusCode, 200, 'First response status code should be 200');
    assert.equal(responses[1].statusCode, 404, 'Second response status code should be 404');
  });

  it('should handle additional params', () => {
    const responseConfig = {
      schema: 'BaseSchema',
      statusCode: 200,
      description: 'Base description'
    };

    const params = {
      statusCode: 201,
      description: 'Override description'
    };

    OpenApiResponse(responseConfig, params)(target, propertyKey, descriptor);

    const responses = Reflect.getMetadata('openapi:responses', target, propertyKey);
    assert.equal(responses[0].statusCode, 201, 'Status code should be overridden');
    assert.equal(responses[0].description, 'Override description', 'Description should be overridden');
    assert.equal(responses[0].schema, 'BaseSchema', 'Schema should be preserved');
  });

  it('should preserve original descriptor', () => {
    const originalValue = descriptor.value;
    
    OpenApiResponse({
      statusCode: 200,
      description: 'Test'
    })(target, propertyKey, descriptor);

    assert.equal(descriptor.value, originalValue, 'Descriptor value should be preserved');
    assert.isTrue(descriptor.writable, 'Descriptor should remain writable');
    assert.isTrue(descriptor.enumerable, 'Descriptor should remain enumerable');
    assert.isTrue(descriptor.configurable, 'Descriptor should remain configurable');
  });
}); 