import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as fs from 'fs';
import * as path from 'path';
import UsersController from '../user.controller';

// Import all controllers
import '../user.controller';

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
if (controllerDesc) {
  spec.tags = [{
    name: controllerDesc.tags[0],
    description: controllerDesc.description
  }];
}

// Create the openapi directory if it doesn't exist
const openapiDir = path.join(__dirname, '../../openapi');
if (!fs.existsSync(openapiDir)) {
  fs.mkdirSync(openapiDir, { recursive: true });
}

// Write the spec to a file
fs.writeFileSync(
  path.join(openapiDir, 'openapi.json'),
  JSON.stringify(spec, null, 2)
);

console.log('OpenAPI specification has been generated successfully!'); 