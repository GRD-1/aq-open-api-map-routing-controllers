import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import { MetadataArgsStorage } from 'routing-controllers';
import { generateOpenAPISpec } from '../../../src/openapi/generate';
import { OpenAPIMapConfig } from '../../../src/openapi/types';
import { SecuritySchemeObject } from 'routing-controllers-openapi/node_modules/openapi3-ts/dist/model';

describe('generateOpenAPISpec', () => {
  let sandbox: sinon.SinonSandbox;
  let mockStorage: any;
  let mockController: any;
  let mockMetadata: any;
  const tempDir = path.join(__dirname, 'temp');
  const testMapPath = path.join(tempDir, 'test-map.json');

  beforeEach(() => {
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    sandbox = sinon.createSandbox();
    
    // Mock controller class
    mockController = class TestController {
      testMethod() {}
    };
    
    // Mock metadata storage with minimal required properties
    mockStorage = {
      controllers: [{
        target: mockController,
        type: 'json' as const,
        route: '/test',
        options: {}
      }],
      actions: [{
        target: mockController,
        method: 'testMethod',
        type: 'get',
        route: '/',
        options: {}
      }],
      params: [{
        object: mockController,
        method: 'testMethod',
        index: 0,
        type: 'body',
        parse: false,
        required: true,
        classTransformer: false,
        validate: false,
        explicitType: String,
        isTargetObject: false
      }],
      responseHandlers: [],
      middlewares: [],
      interceptors: [],
      uses: [],
      useInterceptors: []
    };

    // Mock metadata
    mockMetadata = {
      'openapi:controller:desc': {
        description: 'Test Controller',
        tags: ['Test']
      },
      'openapi:response:aliases': {
        'TestResponse': 'TestResponseAlias'
      },
      'openapi:request:aliases': {
        'TestRequest': 'TestRequestAlias'
      },
      'routing-controllers:response-type': class TestResponse {},
      'routing-controllers:request-type': class TestRequest {}
    };

    // Stub getMetadataArgsStorage
    sandbox.stub(require('routing-controllers'), 'getMetadataArgsStorage').returns(mockStorage);

    // Stub Reflect.getMetadata
    sandbox.stub(Reflect, 'getMetadata').callsFake((key: any, target: Object, propertyKey?: string | symbol) => {
      return mockMetadata[key];
    });

    // Stub validationMetadatasToSchemas
    sandbox.stub(require('class-validator-jsonschema'), 'validationMetadatasToSchemas').returns({
      TestResponse: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        }
      },
      TestRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
    // Clean up temp directory after each test
    if (fs.existsSync(testMapPath)) {
      fs.unlinkSync(testMapPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
  });

  it('should generate OpenAPI spec with correct basic structure', () => {
    const config: OpenAPIMapConfig = {
      controllers: [mockController],
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'Test Description'
      },
      outputPath: testMapPath
    };

    const result = generateOpenAPISpec(config);

    assert.isObject(result, 'Result should be an object');
    assert.deepEqual(result.info, config.info, 'Info object should match config');
    assert.isArray(result.tags, 'Tags should be an array');
    assert.isObject(result.paths, 'Paths should be an object');
    assert.exists(result.components, 'Components should exist');
    assert.isObject(result.components?.schemas, 'Schemas should be an object');
  });

  it('should properly handle controller metadata and generate tags', () => {
    const config: OpenAPIMapConfig = {
      controllers: [mockController],
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'Test Description'
      },
      outputPath: testMapPath
    };

    const result = generateOpenAPISpec(config);

    assert.isArray(result.tags, 'Tags should be an array');
    assert.equal(result.tags.length, 1, 'Should have one tag');
    assert.equal(result.tags[0].name, 'Test', 'Tag name should match controller tag');
    assert.equal(result.tags[0].description, 'Test Controller', 'Tag description should match controller description');
  });

  it('should include security schemes in components', () => {
    const config: OpenAPIMapConfig = {
      controllers: [mockController],
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'Test Description'
      },
      outputPath: testMapPath
    };

    const result = generateOpenAPISpec(config);

    assert.exists(result.components?.securitySchemes, 'Security schemes should exist');
    const bearerAuth = result.components?.securitySchemes?.bearerAuth as SecuritySchemeObject;
    assert.isObject(bearerAuth, 'Bearer auth scheme should be present');
    assert.equal(bearerAuth.type, 'http', 'Auth type should be http');
    assert.equal(bearerAuth.scheme, 'bearer', 'Auth scheme should be bearer');
  });

  it('should handle schema aliases correctly', () => {
    const config: OpenAPIMapConfig = {
      controllers: [mockController],
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'Test Description'
      },
      outputPath: testMapPath
    };

    const result = generateOpenAPISpec(config);

    assert.exists(result.components?.schemas, 'Schemas should exist');
    assert.isObject(result.components?.schemas?.TestResponseAlias, 'Aliased response schema should be present');
    assert.isObject(result.components?.schemas?.TestRequestAlias, 'Aliased request schema should be present');
  });

  it('should generate OpenAPI spec file in the specified location', () => {
    const config: OpenAPIMapConfig = {
      controllers: [mockController],
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'Test Description'
      },
      outputPath: testMapPath
    };

    const result = generateOpenAPISpec(config);

    // Check if file exists
    assert.isTrue(fs.existsSync(testMapPath), 'Generated file should exist in the specified location');

    // Read and parse the generated file
    const fileContent = JSON.parse(fs.readFileSync(testMapPath, 'utf-8'));

    // Compare file content with the returned spec
    assert.deepEqual(fileContent, result, 'File content should match the returned spec');

    // Verify file structure
    assert.isObject(fileContent, 'Generated file should contain a valid JSON object');
    assert.deepEqual(fileContent.info, config.info, 'File should contain correct info object');
    assert.isArray(fileContent.tags, 'File should contain tags array');
    assert.isObject(fileContent.paths, 'File should contain paths object');
    assert.exists(fileContent.components, 'File should contain components');
  });
}); 