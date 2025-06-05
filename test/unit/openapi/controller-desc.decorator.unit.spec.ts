import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';
import { OpenApiControllerDesc } from '../../../src/openapi/decorators';

describe('OpenApiControllerDesc', () => {
  // Mock target class
  class TestController {}

  beforeEach(() => {
    // Clear metadata before each test
    Reflect.deleteMetadata('openapi:controller:desc', TestController);
  });

  it('should store controller description in metadata', () => {
    const options = {
      description: 'Test controller description'
    };

    // Call the decorator function directly
    OpenApiControllerDesc(options)(TestController);

    const metadata = Reflect.getMetadata('openapi:controller:desc', TestController);
    assert.deepEqual(metadata, options, 'Controller description should be stored in metadata');
  });

  it('should store controller description and tags in metadata', () => {
    const options = {
      description: 'Test controller description',
      tags: ['test', 'example']
    };

    OpenApiControllerDesc(options)(TestController);

    const metadata = Reflect.getMetadata('openapi:controller:desc', TestController);
    assert.deepEqual(metadata, options, 'Controller description and tags should be stored in metadata');
    assert.isArray(metadata.tags, 'Tags should be an array');
    assert.equal(metadata.tags.length, 2, 'Should have correct number of tags');
  });

  it('should handle empty tags array', () => {
    const options = {
      description: 'Test controller description',
      tags: []
    };

    OpenApiControllerDesc(options)(TestController);

    const metadata = Reflect.getMetadata('openapi:controller:desc', TestController);
    assert.isArray(metadata.tags, 'Tags should be an array');
    assert.equal(metadata.tags.length, 0, 'Tags array should be empty');
  });

  it('should preserve target class', () => {
    const options = {
      description: 'Test controller description'
    };

    OpenApiControllerDesc(options)(TestController);
    assert.equal(TestController.name, 'TestController', 'Class name should remain unchanged');
  });
}); 