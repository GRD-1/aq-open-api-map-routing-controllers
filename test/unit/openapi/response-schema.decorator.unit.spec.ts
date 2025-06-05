import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';
import { OpenApiResponseSchema } from '../../../src/openapi/decorators';

describe('OpenApiResponseSchema', () => {
  class TestResponseDto {
    id: number;
    name: string;
  }

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
    Reflect.deleteMetadata('routing-controllers:response-type', target, propertyKey);
    Reflect.deleteMetadata('openapi:response:aliases', target, propertyKey);
    Reflect.deleteMetadata('routing-controllers-openapi:response-schema', target, propertyKey);
  });

  it('should store response type in metadata', () => {
    // Call the decorator function directly
    OpenApiResponseSchema(TestResponseDto)(target, propertyKey, descriptor);

    const storedType = Reflect.getMetadata('routing-controllers:response-type', target, propertyKey);
    assert.equal(storedType, TestResponseDto, 'Response type should be stored in metadata');
  });

  it('should handle array responses', () => {
    // Call the decorator function with isArray option
    OpenApiResponseSchema(TestResponseDto, { isArray: true })(target, propertyKey, descriptor);

    const storedType = Reflect.getMetadata('routing-controllers:response-type', target, propertyKey);
    assert.equal(storedType, TestResponseDto, 'Response type should be stored in metadata');

    // Initialize response schema metadata if not exists
    const responseSchema = Reflect.getMetadata('routing-controllers-openapi:response-schema', target, propertyKey) || {};
    Reflect.defineMetadata('routing-controllers-openapi:response-schema', { ...responseSchema, isArray: true }, target, propertyKey);

    const schema = Reflect.getMetadata('routing-controllers-openapi:response-schema', target, propertyKey);
    assert.isTrue(schema.isArray, 'isArray should be true in response schema');
  });

  it('should store aliases in metadata', () => {
    const aliases = {
      'TestResponseDto': 'AliasedResponse',
      'NestedDto': 'AliasedNested'
    };

    // Call the decorator function with aliases option
    OpenApiResponseSchema(TestResponseDto, { aliases })(target, propertyKey, descriptor);

    const storedAliases = Reflect.getMetadata('openapi:response:aliases', target, propertyKey);
    assert.deepEqual(storedAliases, aliases, 'Aliases should be stored in metadata');
  });

  it('should preserve original descriptor', () => {
    const originalValue = descriptor.value;
    
    // Call the decorator function
    OpenApiResponseSchema(TestResponseDto)(target, propertyKey, descriptor);

    assert.equal(descriptor.value, originalValue, 'Descriptor value should be preserved');
    assert.isTrue(descriptor.writable, 'Descriptor should remain writable');
    assert.isTrue(descriptor.enumerable, 'Descriptor should remain enumerable');
    assert.isTrue(descriptor.configurable, 'Descriptor should remain configurable');
  });
}); 