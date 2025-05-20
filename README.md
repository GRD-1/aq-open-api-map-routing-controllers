# AQ Open API Map Routing Controllers

A Node.js application that demonstrates the implementation of OpenAPI documentation using routing-controllers and reef-framework.

## Table of Contents

- [Launch](#launch)
- [OpenAPI Documentation](#openapi-documentation)
  - [Overview](#overview)
  - [Decorators](#decorators)
  - [Configs](#configs)
    - [Available Maps](#available-maps)
    - [Creating a New Map](#creating-a-new-map)
  - [Working with Documentation](#working-with-documentation)
  - [References](#references)

## Launch

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v15 or higher)
- Docker and Docker Compose (optional)

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd aq-open-api-map-routing-controllers
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.sample .env
```
Edit `.env` file with your database credentials if needed.

4. Start the PostgreSQL container:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run migrate:up
```

6. Run the application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## OpenAPI Documentation

### Overview

This document provides an overview of the tool that generates OpenAPI map based on decorators that we are using in this project. This tool based on the [routing-controllers](https://www.npmjs.com/package/routing-controllers) library. 

All decorators we use are prefixed with `OpenApi` for consistency and compatibility with reef-framework.

For typing the fields in DTOs we use [class-validator](https://www.npmjs.com/package/class-validator) decorators, for descriptions in DTOs - [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 

### Decorators

#### Controller Decorators

- `@OpenApiAuth()`                          - Marks controller methods as requiring authentication

- `@OpenApiJsonController('/users')`        - Defines base path and marks controller as returning JSON

- `@OpenApiControllerDesc({ ... })`         - Provides description and tags for Swagger UI grouping


#### Method Decorators

- `@OpenApiAuth()`                          - Marks method as requiring authentication

- `@OpenApiGet('/users')`                   - Defines GET endpoint with path

- `@OpenApiPost('/users')`                  - Defines POST endpoint with path

- `@OpenApiPut('/users/:id')`               - Defines PUT endpoint with path

- `@OpenApiPatch('/users/:id')`             - Defines PATCH endpoint with path

- `@OpenApiDelete('/users/:id')`            - Defines DELETE endpoint with path


#### Parameter Decorators

- `@OpenApiBody()`                          - Marks parameter as request body and documents it in Swagger UI

- `@OpenApiParam('id')`                     - Marks parameter as path parameter and documents it in Swagger UI

- `@OpenApiReq()`                           - Marks parameter as Express Request object

- `@OpenApiRes()`                           - Marks parameter as Express Response object

#### Response Schema Decorator

- `@OpenApiResponseSchema(UserResponseDto)` - Defines the response schema for Swagger UI documentation

Example:
```typescript
@OpenApiResponseSchema(UserResponseDto)
```

#### Usage Example

```typescript
@OpenApiJsonController('/users')                    // Base path for all controller endpoints
@OpenApiControllerDesc({                            // Controller description and grouping
  description: "Controller for managing user accounts",
  tags: ["Users"]
})
@OpenApiAuth()                                      // All methods require authentication
@Controller('/users')
export class UsersController {
  @OpenApiPatch('/:id')                             // PATCH endpoint at /users/:id
  @OpenAPI({                                        // Additional OpenAPI metadata
    summary: 'Partially update a user',
    description: 'Updates specific fields of an existing user'
  })
  @OpenApiResponseSchema(UpdateUsersDtoRes)         // Response will match this schema
  async patchUser(
    @OpenApiParam('id') id: number,                 // Path parameter
    @OpenApiBody() body: Partial<UpdateUserDtoReq>  // Request body
  ): Promise<UpdateUsersDtoRes> {
    // ...
  }
}
```

### Configs

The OpenAPI documentation can be split into multiple maps, each containing a specific set of controllers. This is useful when you want to provide different API documentation for different parts of your application.

#### Available Maps

The maps are configured in `src/openapi/configs/`:
- `all.config.ts` - includes all controllers
- `users-and-things.config.ts` - includes only Users and Things controllers
- `customers-and-things.config.ts` - includes only Customers and Things controllers

#### Creating a New Map

To create a new map:

1. Create a new config file in `src/openapi/configs/`, e.g., `my-new-map.config.ts`:
```typescript
import { OpenAPIMapConfig } from '../types';
import UsersController from '../../users/user.controller';
import ThingsController from '../../things/things.controller';
import path from 'path';

export const myNewMapConfig: OpenAPIMapConfig = {
  controllers: [
    UsersController,
    ThingsController
  ],
  info: {
    title: 'AQ Open API Map - My New Map',
    version: '1.0.0',
    description: 'API documentation for specific controllers'
  },
  outputPath: path.join(process.cwd(), 'openapi', 'my-new-map.json')
};
```

2. Register your map in `src/openapi/configs/index.ts`:
```typescript
import { OpenAPIMapConfig } from '../types';
import { allConfig } from './all.config';
import { myNewMapConfig } from './my-new-map.config';

export const mapConfigs: Record<string, OpenAPIMapConfig> = {
  'all': allConfig,
  'my-new-map': myNewMapConfig
};
```

Your new map will be automatically available at:
```
http://localhost:3000/api/v1/openapi/ui?mapName=my-new-map
http://localhost:3000/api/v1/openapi/json?mapName=my-new-map
```

### Working with Documentation

The OpenAPI documentation is automatically generated from your controllers and DTOs using the decorators described above.

To see the map in browser:
```
http://localhost:3000/api/v1/openapi/ui
```

To get the map in JSON format:
```
http://localhost:3000/api/v1/openapi/json
```

The OpenAPI specification is automatically generated when accessing either the UI or JSON endpoints. You can specify which map to use by adding the `mapName` query parameter:

```
http://localhost:3000/api/v1/openapi/ui?mapName=users-and-things
```

Available maps:
- `all` (default) - includes all controllers
- `users-and-things` - includes only Users and Things controllers
- `customers-and-things` - includes only Customers and Things controllers

### References

- [routing-controllers](https://www.npmjs.com/package/routing-controllers)
- [routing-controllers-openapi](https://www.npmjs.com/package/routing-controllers-openapi)
- [class-validator](https://www.npmjs.com/package/class-validator)
- [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 