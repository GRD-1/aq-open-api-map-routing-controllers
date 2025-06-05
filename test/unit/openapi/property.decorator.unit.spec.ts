import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';
import { OpenApiProperty } from '../../../src/openapi/decorators';

describe('OpenApiProperty', () => {
  // Mock target class and property
  class TestClass {}
  const target = TestClass.prototype;
  const propertyKey = 'testProperty';

  beforeEach(() => {
    // Clear metadata before each test
    Reflect.deleteMetadata('openapi:property', target, propertyKey);
  });

  it('should store property description in metadata', () => {
    const options = {
      description: 'Test property description'
    };

    // Call the decorator function directly
    OpenApiProperty(options)(target, propertyKey);

    const metadata = Reflect.getMetadata('openapi:property', target, propertyKey);
    assert.deepEqual(metadata, options, 'Property description should be stored in metadata');
  });

  it('should store property description and example in metadata', () => {
    const options = {
      description: 'Test property description',
      example: 'test example'
    };

    OpenApiProperty(options)(target, propertyKey);

    const metadata = Reflect.getMetadata('openapi:property', target, propertyKey);
    assert.deepEqual(metadata, options, 'Property description and example should be stored in metadata');
    assert.equal(metadata.example, 'test example', 'Example should match configuration');
  });

  it('should handle different types of examples', () => {
    const numberExample = {
      description: 'Number property',
      example: 123
    };

    const booleanExample = {
      description: 'Boolean property',
      example: true
    };

    const objectExample = {
      description: 'Object property',
      example: { key: 'value' }
    };

    OpenApiProperty(numberExample)(target, 'numberProp');
    OpenApiProperty(booleanExample)(target, 'booleanProp');
    OpenApiProperty(objectExample)(target, 'objectProp');

    const numberMetadata = Reflect.getMetadata('openapi:property', target, 'numberProp');
    const booleanMetadata = Reflect.getMetadata('openapi:property', target, 'booleanProp');
    const objectMetadata = Reflect.getMetadata('openapi:property', target, 'objectProp');

    assert.equal(numberMetadata.example, 123, 'Number example should be preserved');
    assert.equal(booleanMetadata.example, true, 'Boolean example should be preserved');
    assert.deepEqual(objectMetadata.example, { key: 'value' }, 'Object example should be preserved');
  });

  it('should store metadata independently for different properties', () => {
    const firstOptions = {
      description: 'First property',
      example: 1
    };

    const secondOptions = {
      description: 'Second property',
      example: 2
    };

    OpenApiProperty(firstOptions)(target, 'firstProp');
    OpenApiProperty(secondOptions)(target, 'secondProp');

    const firstMetadata = Reflect.getMetadata('openapi:property', target, 'firstProp');
    const secondMetadata = Reflect.getMetadata('openapi:property', target, 'secondProp');

    assert.notDeepEqual(firstMetadata, secondMetadata, 'Different properties should have different metadata');
    assert.equal(firstMetadata.example, 1, 'First property example should be preserved');
    assert.equal(secondMetadata.example, 2, 'Second property example should be preserved');
  });
}); 