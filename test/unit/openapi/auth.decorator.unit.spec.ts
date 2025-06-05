import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';
import { OpenApiAuth } from '../../../src/openapi/decorators';

describe('OpenApiAuth', () => {
  describe('Method Decorator', () => {
    // Mock target, propertyKey and descriptor for method decorator
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
    });

    it('should add security requirement to method metadata', () => {
      // Call the decorator function directly
      OpenApiAuth()(target, propertyKey, descriptor);

      const metadata = Reflect.getMetadata('openapi', target, propertyKey);
      assert.isDefined(metadata, 'Metadata should be defined');
      assert.isDefined(metadata.security, 'Security should be defined');
      assert.isArray(metadata.security, 'Security should be an array');
      assert.deepEqual(metadata.security, [{ bearerAuth: [] }], 'Security requirement should be properly configured');
    });

    it('should preserve existing method metadata', () => {
      // Set some existing metadata
      const existingMetadata = {
        responses: {
          200: 'OK'
        }
      };
      Reflect.defineMetadata('openapi', existingMetadata, target, propertyKey);

      OpenApiAuth()(target, propertyKey, descriptor);

      const metadata = Reflect.getMetadata('openapi', target, propertyKey);
      assert.isDefined(metadata.responses, 'Existing metadata should be preserved');
      assert.isDefined(metadata.security, 'Security should be added');
    });
  });

  describe('Class Decorator', () => {
    // Mock target class
    class TestController {}

    beforeEach(() => {
      // Clear metadata before each test
      Reflect.deleteMetadata('openapi', TestController);
    });

    it('should add security scheme to controller metadata', () => {
      // Call the decorator function directly
      OpenApiAuth()(TestController);

      const metadata = Reflect.getMetadata('openapi', TestController);
      assert.isDefined(metadata.components, 'Components should be defined');
      assert.isDefined(metadata.components.securitySchemes, 'Security schemes should be defined');
      
      const bearerAuth = metadata.components.securitySchemes.bearerAuth;
      assert.isDefined(bearerAuth, 'Bearer auth scheme should be defined');
      assert.equal(bearerAuth.type, 'http', 'Auth type should be http');
      assert.equal(bearerAuth.scheme, 'bearer', 'Auth scheme should be bearer');
      assert.equal(bearerAuth.bearerFormat, 'JWT', 'Bearer format should be JWT');
      assert.equal(bearerAuth.description, 'Enter your JWT token in the format: Bearer <token>', 'Description should be set');
    });

    it('should add security requirement to controller metadata', () => {
      OpenApiAuth()(TestController);

      const metadata = Reflect.getMetadata('openapi', TestController);
      assert.isDefined(metadata.security, 'Security should be defined');
      assert.isArray(metadata.security, 'Security should be an array');
      assert.deepEqual(metadata.security, [{ bearerAuth: [] }], 'Security requirement should be properly configured');
    });

    it('should preserve existing controller metadata', () => {
      // Set some existing metadata
      const existingMetadata = {
        tags: ['test']
      };
      Reflect.defineMetadata('openapi', existingMetadata, TestController);

      OpenApiAuth()(TestController);

      const metadata = Reflect.getMetadata('openapi', TestController);
      assert.isDefined(metadata.tags, 'Existing metadata should be preserved');
      assert.isDefined(metadata.security, 'Security should be added');
      assert.isDefined(metadata.components, 'Components should be added');
    });
  });
}); 