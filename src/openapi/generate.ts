import 'reflect-metadata';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as fs from 'fs';
import * as path from 'path';
import UsersController from '../user.controller';

// Import all controllers
import '../user.controller';

try {
  // Generate OpenAPI spec
  const storage = getMetadataArgsStorage();
  const schemas = validationMetadatasToSchemas();

  const spec = routingControllersToSpec(storage, {
    controllers: [UsersController],
    routePrefix: '/api/v1'
  }, {
    components: {
      schemas
    },
    info: {
      title: 'AQ Open API Map Routing Controllers',
      version: '1.0.0',
      description: 'API documentation for the AQ Open API Map Routing Controllers',
    }
  });

  // Extract controller description from metadata
  const controllerDesc = Reflect.getMetadata('openapi:controller:desc', UsersController);
  if (!controllerDesc) {
    console.warn('Warning: No controller description metadata found for UsersController');
  }

  // Initialize tags array if not present
  spec.tags = spec.tags || [];

  // Add or update controller description in tags
  if (controllerDesc && controllerDesc.tags && controllerDesc.tags.length > 0) {
    const tag = controllerDesc.tags[0];
    const existingTagIndex = spec.tags.findIndex(t => t.name === tag);
    
    if (existingTagIndex >= 0) {
      spec.tags[existingTagIndex].description = controllerDesc.description;
    } else {
      spec.tags.push({
        name: tag,
        description: controllerDesc.description
      });
    }
  }

  // Create the openapi directory if it doesn't exist
  const openapiDir = path.join(__dirname, '../../openapi');
  if (!fs.existsSync(openapiDir)) {
    fs.mkdirSync(openapiDir, { recursive: true });
  }

  // Write the spec to a file
  const outputPath = path.join(openapiDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

  console.log('OpenAPI specification has been generated successfully!');
  console.log(`File written to: ${outputPath}`);
} catch (error) {
  console.error('Error generating OpenAPI specification:', error);
  process.exit(1);
} 