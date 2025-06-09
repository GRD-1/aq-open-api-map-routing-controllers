import { assert } from 'chai';
import 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import OpenApiController from '../../../server/open-api/open-api.controller';
import { mapConfigs } from '../../../server/open-api/map-configs';
import { DefaultCasters } from 'reef-framework/pkg/helpers/default-casters.helper';
import { GenericLogger } from 'reef-framework/pkg/helpers/aq-base.types';

describe('OpenAPIController', () => {
  let controller: OpenApiController;
  let app: express.Express;
  let mockLogger: GenericLogger;

  beforeEach(() => {
    app = express();

    // Mock logger
    mockLogger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {}
    };

    // Initialize controller with required dependencies
    controller = new OpenApiController(
      app,                          // Express app
      '/api/v1',                    // Main route path
      new DefaultCasters(),         // Default casters
      () => 'test-trace-id',        // Trace ID generator
      () => mockLogger,             // Logger factory
      undefined,                    // Middleware generator (optional)
      'test-bundle'                 // Bundle name
    );
  });

  afterEach(() => {
    // Clean up generated files after each test
    Object.values(mapConfigs).forEach(config => {
      if (fs.existsSync(config.outputPath)) {
        fs.unlinkSync(config.outputPath);
      }
    });
  });

  describe('GET /openapi/json', () => {
    it('should generate and return OpenAPI spec for default "all" map', async () => {
      const result = await controller.getOpenAPIJson();

      assert.isObject(result, 'Result should be an object');
      assert.deepNestedInclude(result, {
        info: {
          title: 'AQ Open API Map - All Controllers',
          version: '1.0.0',
          description: 'API documentation for all available controllers'
        }
      }, 'Result should contain correct info object');
      assert.isObject(result.paths, 'Result should contain paths object');
      assert.isObject(result.components, 'Result should contain components object');
      assert.isObject(result.components.schemas, 'Result should contain schemas object');
    });

    it('should throw error for invalid map name', async () => {
      let error: Error | null = null;

      try {
        await controller.getOpenAPIJson('invalid-map');
        assert.fail('Should have thrown an error');
      } catch (err) {
        error = err as Error;
      }

      assert.instanceOf(error, Error, 'Should throw an Error instance');
      assert.include(error!.message, 'Invalid map name', 'Error message should mention invalid map');
      assert.include(error!.message, Object.keys(mapConfigs).join(', '), 'Error message should list available maps');
    });

    it('should create output file in the correct location', async () => {
      const result = await controller.getOpenAPIJson();
      const outputPath = path.join(process.cwd(), 'openapi', 'all.json');

      assert.isTrue(fs.existsSync(outputPath), 'Output file should exist');

      const fileContent = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      assert.deepEqual(fileContent, result, 'File content should match the returned spec');
    });
  });
});