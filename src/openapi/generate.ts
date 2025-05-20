import 'reflect-metadata';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { OpenAPIObject, ResponseObject, ParameterObject, SecuritySchemeObject, ComponentsObject, SchemaObject, ReferenceObject } from 'routing-controllers-openapi/node_modules/openapi3-ts/dist/model/OpenApi';
import fs from 'fs';
import path from 'path';
import UsersController from '../users/user.controller';
import ThingsController from '../things/things.controller';
import CustomersController from '../customers/customers.controller';

interface OpenAPISpec extends OpenAPIObject {
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
  components?: ComponentsObject;
}

function findSchemaRefs(obj: any, refs: Set<string>) {
  if (!obj || typeof obj !== 'object') return;
  
  if (obj.$ref && typeof obj.$ref === 'string') {
    const match = obj.$ref.match(/#\/components\/schemas\/([^/]+)/);
    if (match) {
      refs.add(match[1]);
    }
  }
  
  for (const value of Object.values(obj)) {
    findSchemaRefs(value, refs);
  }
}

export function generateOpenAPISpec() {
  // Get metadata from routing-controllers
  const storage = getMetadataArgsStorage();
  const schemas = validationMetadatasToSchemas() as Record<string, SchemaObject | ReferenceObject>;
  const usedSchemas = new Set<string>();

  // Generate initial spec with schemas
  const spec = routingControllersToSpec(
    storage,
    { 
      controllers: [UsersController, ThingsController, CustomersController],
      routePrefix: '/api/v1',
      defaults: {
        paramOptions: {
          required: true,
        },
      },
      classTransformer: true,
      validation: true,
      development: false,
    },
    {
      components: {
        schemas,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token in the format: Bearer <token>'
          } as SecuritySchemeObject
        }
      },
      info: {
        title: 'AQ Open API Map Routing Controllers',
        version: '1.0.0',
        description: 'API documentation for the AQ Open API Map Routing Controllers',
      },
      tags: []
    },
  ) as OpenAPISpec;

  // Add controller metadata to tags and collect used schemas
  const controllers = [UsersController, ThingsController, CustomersController];
  
  controllers.forEach(controller => {
    const metadata = Reflect.getMetadata('openapi:controller:desc', controller);
    if (metadata) {
      const controllerName = controller.name.replace('Controller', '').split(/(?=[A-Z])/).join(' ');
      const tagName = metadata.tags?.[0] || controllerName;
      
      // Find existing tag or create one
      let tag = spec.tags.find(t => t.name === tagName);
      if (!tag) {
        tag = { name: tagName, description: metadata.description };
        spec.tags.push(tag);
      } else {
        tag.description = metadata.description;
      }

      // Process each method in the controller
      Object.entries(spec.paths || {}).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (operation.operationId?.startsWith(controller.name + '.')) {
            operation.tags = [tagName];
            
            const methodName = operation.operationId.split('.').pop();
            if (methodName) {
              // Check for both custom and routing-controllers OpenAPI decorators
              const hasCustomOpenApiDecorator = 
                Reflect.getMetadata('openapi:action', controller.prototype, methodName) ||
                Reflect.getMetadata('openapi:response', controller.prototype, methodName) ||
                Reflect.getMetadata('openapi:request', controller.prototype, methodName);

              const hasRoutingOpenApiDecorator = 
                Reflect.getMetadata('routing-controllers:openapi', controller.prototype, methodName) ||
                Reflect.getMetadata('routing-controllers:response-schema', controller.prototype, methodName);

              const hasOpenApiDecorator = hasCustomOpenApiDecorator || hasRoutingOpenApiDecorator;

              // Collect schemas from request body
              if (operation.requestBody?.content?.['application/json']?.schema) {
                findSchemaRefs(operation.requestBody.content['application/json'].schema, usedSchemas);
              }

              // Collect schemas from responses
              if (operation.responses) {
                Object.values(operation.responses).forEach(response => {
                  const res = response as ResponseObject;
                  if (res.content?.['application/json']?.schema) {
                    findSchemaRefs(res.content['application/json'].schema, usedSchemas);
                  }
                });
              }

              // Collect schemas from parameters
              if (operation.parameters) {
                operation.parameters.forEach((param: ParameterObject) => {
                  if (param.schema) {
                    findSchemaRefs(param.schema, usedSchemas);
                  }
                });
              }

              // Handle security
              const openApiMetadata = Reflect.getMetadata('openapi', controller.prototype, methodName) ||
                                    Reflect.getMetadata('routing-controllers:openapi', controller.prototype, methodName);
              if (openApiMetadata?.security) {
                operation.security = openApiMetadata.security;
              } else {
                delete operation.security;
                delete spec.security;
              }
            }
          }
        });
      });

      // Handle controller-level OpenAPI metadata
      const controllerOpenApi = Reflect.getMetadata('openapi', controller) ||
                               Reflect.getMetadata('routing-controllers:openapi', controller);
      if (controllerOpenApi) {
        if (controllerOpenApi.components?.securitySchemes) {
          if (!spec.components) {
            spec.components = {};
          }
          if (!spec.components.securitySchemes) {
            spec.components.securitySchemes = {};
          }
          Object.assign(spec.components.securitySchemes, controllerOpenApi.components.securitySchemes);
        }

        if (controllerOpenApi.security) {
          spec.security = controllerOpenApi.security;
        }
      }
    }
  });

  // Filter schemas to only include those that are used
  const filteredSchemas: Record<string, SchemaObject | ReferenceObject> = {};
  for (const [name, schema] of Object.entries(schemas)) {
    if (usedSchemas.has(name)) {
      filteredSchemas[name] = schema;
    }
  }

  // Update spec with filtered schemas
  spec.components = spec.components || {};
  spec.components.schemas = filteredSchemas;

  // Write the OpenAPI spec to a file
  const outputPath = path.join(process.cwd(), 'openapi', 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
  console.log('OpenAPI specification has been generated successfully!');
  console.log(`File written to: ${outputPath}`);

  return spec;
}

// Only run if this file is being executed directly
if (require.main === module) {
  generateOpenAPISpec();
} 