import 'reflect-metadata';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import fs from 'fs';
import path from 'path';
import UsersController from '../users/user.controller';

interface OpenAPISpec {
  tags: Array<{ name: string; description: string }>;
  paths: {
    [path: string]: {
      [method: string]: {
        operationId?: string;
        tags?: string[];
        security?: Array<{ [key: string]: string[] }>;
        [key: string]: any;
      };
    };
  };
  components?: {
    securitySchemes?: {
      [key: string]: {
        type: string;
        scheme: string;
        bearerFormat?: string;
        description?: string;
      };
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export function generateOpenAPISpec() {
  // Get metadata from routing-controllers
  const storage = getMetadataArgsStorage();
  const schemas = validationMetadatasToSchemas() as any; // Type assertion to avoid schema type mismatch

  // Generate OpenAPI spec
  const spec = routingControllersToSpec(
    storage,
    { 
      controllers: [UsersController], // Only include UsersController
      routePrefix: '/api/v1'  // Add the route prefix to match our API versioning
    },
    {
      components: { 
        schemas
      },
      info: {
        title: 'AQ Open API Map Routing Controllers',
        version: '1.0.0',
        description: 'API documentation for the AQ Open API Map Routing Controllers',
      },
      tags: [] // Initialize tags array
    },
  ) as OpenAPISpec;

  // Add controller metadata to tags
  const controllers = [UsersController]; // Only include UsersController
  controllers.forEach(controller => {
    const metadata = Reflect.getMetadata('openapi:controller:desc', controller);
    if (metadata) {
      // Get the base path from the controller's metadata
      const basePath = Reflect.getMetadata('path', controller) || '';
      // Get controller name without 'Controller' suffix and format it
      const controllerName = controller.name.replace('Controller', '').split(/(?=[A-Z])/).join(' ');
      // Use tags if provided, otherwise use formatted controller name
      const tagName = metadata.tags?.[0] || controllerName;
      
      console.log(`Defined controller metadata for ${controller.name}:`, metadata);
      
      // Find existing tag or create one
      let tag = spec.tags.find(t => t.name === tagName);
      if (!tag) {
        tag = { name: tagName, description: metadata.description };
        spec.tags.push(tag);
      } else {
        tag.description = metadata.description;
      }

      // Check if any method has OpenApiAuth decorator
      let hasAuthDecorator = false;
      Object.entries(spec.paths).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (operation.operationId?.startsWith(controller.name + '.')) {
            operation.tags = [tagName];
            
            // Get OpenAPI metadata for the method
            const methodName = operation.operationId.split('.').pop();
            if (methodName) {
              const openApiMetadata = Reflect.getMetadata('openapi', controller.prototype, methodName);
              if (openApiMetadata?.security) {
                operation.security = openApiMetadata.security;
                hasAuthDecorator = true;
              }
            }
          }
        });
      });

      // If any method has OpenApiAuth decorator, add security scheme to components
      if (hasAuthDecorator) {
        if (!spec.components) {
          spec.components = {};
        }
        if (!spec.components.securitySchemes) {
          spec.components.securitySchemes = {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter your JWT token in the format: Bearer <token>'
            }
          };
        }
      }

      // Get controller-level OpenAPI metadata
      const controllerOpenApi = Reflect.getMetadata('openapi', controller);
      if (controllerOpenApi) {
        // Add security schemes if defined at controller level
        if (controllerOpenApi.components?.securitySchemes) {
          if (!spec.components) {
            spec.components = {};
          }
          if (!spec.components.securitySchemes) {
            spec.components.securitySchemes = {};
          }
          Object.assign(spec.components.securitySchemes, controllerOpenApi.components.securitySchemes);
        }

        // Add global security if defined at controller level
        if (controllerOpenApi.security) {
          spec.security = controllerOpenApi.security;
        }
      }
    }
  });

  return spec;
}

export function writeOpenAPISpec(spec: OpenAPISpec) {
  // Ensure openapi directory exists
  const openapiDir = path.join(process.cwd(), 'openapi');
  if (!fs.existsSync(openapiDir)) {
    fs.mkdirSync(openapiDir);
  }

  // Write spec to file
  const filePath = path.join(openapiDir, 'openapi.json');
  fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));
  console.log('OpenAPI specification has been generated successfully!');
  console.log('File written to:', filePath);
}

// Only run if this file is being executed directly
if (require.main === module) {
  const spec = generateOpenAPISpec();
  writeOpenAPISpec(spec);
} 