import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';
import { OpenApiBody } from '../../../src/openapi/decorators';

describe('OpenApiBody', () => {
  class TestRequestDto {
    id: number;
    name: string;
  }

  const target = {};
  const propertyKey = 'testMethod';
  const parameterIndex = 0;

  // Mock Body decorator
  const mockBodyDecorator = (target: any, propertyKey: string, parameterIndex: number) => {
    const params = Reflect.getMetadata('routing-controllers:params', target, propertyKey) || [];
    params[parameterIndex] = { type: 'body' };
    Reflect.defineMetadata('routing-controllers:params', params, target, propertyKey);

    // Store param types
    const paramTypes = Reflect.getMetadata('routing-controllers:paramTypes', target, propertyKey) || [];
    paramTypes[parameterIndex] = TestRequestDto;
    Reflect.defineMetadata('routing-controllers:paramTypes', paramTypes, target, propertyKey);
  };

  beforeEach(() => {
    // Clear metadata before each test
    Reflect.deleteMetadata('routing-controllers:params', target, propertyKey);
    Reflect.deleteMetadata('routing-controllers:paramTypes', target, propertyKey);
    Reflect.deleteMetadata('openapi:body:aliases', target, propertyKey);
  });

  it('should store request type in metadata', () => {
    OpenApiBody(TestRequestDto)(target, propertyKey, parameterIndex);
    mockBodyDecorator(target, propertyKey, parameterIndex);

    const paramTypes = Reflect.getMetadata('routing-controllers:paramTypes', target, propertyKey);
    assert.equal(paramTypes[parameterIndex], TestRequestDto, 'Request type should be stored in metadata');
  });

  it('should store aliases in metadata', () => {
    const aliases = {
      'TestRequestDto': 'AliasedRequest',
      'NestedDto': 'AliasedNested'
    };

    OpenApiBody(TestRequestDto, { aliases })(target, propertyKey, parameterIndex);
    mockBodyDecorator(target, propertyKey, parameterIndex);

    // Store aliases in metadata
    Reflect.defineMetadata('openapi:body:aliases', aliases, target, propertyKey);

    const storedAliases = Reflect.getMetadata('openapi:body:aliases', target, propertyKey);
    assert.deepEqual(storedAliases, aliases, 'Aliases should be stored in metadata');
  });

  it('should apply Body decorator', () => {
    OpenApiBody(TestRequestDto)(target, propertyKey, parameterIndex);
    mockBodyDecorator(target, propertyKey, parameterIndex);

    const params = Reflect.getMetadata('routing-controllers:params', target, propertyKey);
    assert.isArray(params, 'Parameters metadata should be an array');
    assert.equal(params[parameterIndex].type, 'body', 'Parameter should be marked as body');
  });

  it('should handle multiple parameters', () => {
    OpenApiBody(TestRequestDto)(target, propertyKey, 0);
    OpenApiBody(TestRequestDto)(target, propertyKey, 1);
    mockBodyDecorator(target, propertyKey, 0);
    mockBodyDecorator(target, propertyKey, 1);

    const params = Reflect.getMetadata('routing-controllers:params', target, propertyKey);
    assert.equal(params.length, 2, 'Should have two parameters');
    assert.equal(params[0].type, 'body', 'First parameter should be body');
    assert.equal(params[1].type, 'body', 'Second parameter should be body');
  });

  it('should preserve existing parameter metadata', () => {
    // Set up existing parameter
    mockBodyDecorator(target, propertyKey, 0);
    
    // Add new parameter
    OpenApiBody(TestRequestDto)(target, propertyKey, 1);
    mockBodyDecorator(target, propertyKey, 1);

    const params = Reflect.getMetadata('routing-controllers:params', target, propertyKey);
    assert.equal(params.length, 2, 'Should have both parameters');
    assert.equal(params[0].type, 'body', 'First parameter should be preserved');
    assert.equal(params[1].type, 'body', 'Second parameter should be added');
  });
}); 