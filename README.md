# AQ Open API Map Routing Controllers

A Node.js application that demonstrates the implementation of OpenAPI documentation using routing-controllers and reef-framework.

## Table of Contents

- [Launch](#launch)
- [OpenAPI Documentation](#openapi-documentation)
  - [Overview](#overview)
  - [Feature structure](#feature-structure)
  - [Decorators](#decorators)
  - [Usage](#usage)
    - [Usage in controller](#usage-in-controller)
    - [Usage in DTOs](#usage-in-dtos)
    - [Nested objects in DTO](#nested-objects-in-dto)
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

### Feature structure

```
src/
├── openapi/
│   ├── configs/                 # OpenAPI map configurations
│   │   ├── all.config.ts       # Config for all controllers
│   │   └── index.ts            # Map configs registry
│   ├── decorators.ts           # Custom OpenAPI decorators
│   ├── generate.ts             # OpenAPI spec generation logic
│   └── types.ts                # Type definitions
├── controllers/                 # API Controllers
│   ├── users.controller.ts     # User management endpoints
│   └── things.controller.ts    # Things management endpoints
├── dto/                        # Data Transfer Objects
│   ├── user.dto.ts            # User-related DTOs
│   └── thing.dto.ts           # Thing-related DTOs
└── index.ts                    # Application entry point
```

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

- `@OpenAPI({ ... })`                       - Additional OpenAPI metadata for endpoints

- `@OpenApiDefaultHttpStatus(201)`          - Sets default HTTP status code for endpoint

- `@OpenApiResponseSchema(UserResponseDto)` - Defines the response schema for Swagger UI documentation

- `@OpenApiResponse({ ... })`               - Defines additional response types with status codes and schemas


#### Parameter Decorators

- `@OpenApiBody()`                          - Marks parameter as request body and documents it in Swagger UI

- `@OpenApiParam('id')`                     - Marks parameter as path parameter and documents it in Swagger UI

- `@OpenApiReq()`                           - Marks parameter as Express Request object

- `@OpenApiRes()`                           - Marks parameter as Express Response object

- `@OpenApiQueryParams()`                   - Defines query parameters using a DTO class


### Usage

#### Usage in controller

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
  @OpenApiDefaultHttpStatus(200)                    // Sets default success status code
  @OpenApiResponseSchema(UpdateUsersDtoRes, {       // Response schema with aliases
    aliases: {
      'UpdateUsersDtoRes': 'UpdateUsersResAlias',
      'UserProfile': 'UserProfileAlias'            // Alias for nested type
    }
  })
  @OpenApiResponse({                                // Another response type
    statusCode: 404,
    description: 'User not found',
    schema: 'NotFound'
    contentType: 'application/json'
 })
  async patchUser(
    @OpenApiParam('id') id: number,                 // Path parameter
    @OpenApiBody(UpdateUserDtoReq, {               // Request body with aliases
      aliases: {
        'UpdateUserDtoReq': 'UpdateUserReqAlias',
        'UserProfile': 'UserProfileAlias'          // Alias for nested type
      }
    }) body: UpdateUserDtoReq
  ): Promise<UpdateUsersDtoRes> {
    // ... implementation
  }
}
```

#### Usage in DTOs

When creating DTOs, it is necessary to type each field using `class-validator` decorators. The library `class-validator-jsonschema` is used to extract metadata for OpenAPI documentation, but it can only extract this metadata if the fields in DTO have validation decorators from `class-validator`.

Required decorators for proper OpenAPI documentation:
- `@IsString()`
- `@IsEmail()`
- `@IsNumber()`
- `@IsDate()`
- `@IsBoolean()`
- etc.

Example:
```typescript
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export class CreateUserDtoReq {
  @IsString()
  @JSONSchema({
    description: 'User full name',
    example: 'John Doe'
  })
  name: string;

  @IsEmail()
  @JSONSchema({
    description: 'User email address',
    example: 'john@example.com'
  })
  email: string;

  @IsOptional()
  @IsString()
  @JSONSchema({
    description: 'Additional user information',
    example: 'Preferred contact time: evening'
  })
  notes?: string;
}
```

#### Nested objects in DTO

When working with DTOs that contain nested objects, you need to properly decorate them to ensure they appear correctly in the generated OpenAPI documentation:

```typescript
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

// Nested DTO for user data
export class UserDataDto {
  @IsNumber()
  @JSONSchema({
    description: 'User unique identifier',
    type: 'number'
  })
  id: number;

  @IsEmail()
  @JSONSchema({
    description: 'User email address',
    type: 'string'
  })
  email: string;
}

// Response DTO with array of users
export class GetUsersDtoRes {
  @IsString()
  @JSONSchema({
    description: 'Response status',
    type: 'string'
  })
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDataDto)
  @JSONSchema({
    description: 'List of users',
    type: 'array',
    items: { 
      $ref: '#/components/schemas/UserDataDto'
    }
  })
  data: UserDataDto[];
}
```

If you use aliases for DTO objects you need to replace the original types with the aliases: 
- Replace `@Type(() => UserDataDto)` with `@Type(() => UserDataDtoAlias)`
- Replace schema references:
```typescript
@JSONSchema({
  description: 'List of users',
  type: 'array',
  items: { 
    $ref: '#/components/schemas/UserDataDtoAlias'  // Use alias in items reference
  }
})
```

Then provide the aliases in the controller:
```typescript
@OpenApiGet('/')
@OpenAPI({
  summary: 'Get all users',
  description: 'Retrieves a list of all users'
})
@OpenApiDefaultHttpStatus(200)
@OpenApiResponseSchema(GetUsersDtoRes, {
  aliases: {
    'GetUsersDtoRes': 'GetUsersResAlias',    // Main DTO alias
    'UserDataDto': 'UserDataDtoAlias'        // Nested object alias
  }
})
async getAllUsers(): Promise<GetUsersDtoRes> {
  // ... implementation
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