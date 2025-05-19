# AQ Open API Map Routing Controllers

A Node.js application that demonstrates the implementation of OpenAPI documentation using routing-controllers and reef-framework.

## Table of Contents

- [Launch](#launch)
- [OpenAPI Documentation](#openapi-documentation)
  - [Overview](#overview)
  - [Decorators](#decorators)
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
```typescript
@OpenApiJsonController('/users')
@OpenApiControllerDesc({
  description: "Controller for managing user accounts",
  tags: ["Users"]
})
```

#### Method Decorators
```typescript
@OpenApiGet('/users')
@OpenApiPost('/users')
@OpenApiPut('/users/:id')
@OpenApiPatch('/users/:id')
@OpenApiDelete('/users/:id')
```

#### Parameter Decorators
```typescript
@OpenApiBody()
@OpenApiParam('id')
@OpenApiReq()
@OpenApiRes()
```

#### Response Schema Decorator
```typescript
@OpenApiResponseSchema(UserResponseDto)
```

#### Usage Example

```typescript
@OpenApiJsonController('/users')
@OpenApiControllerDesc({
  description: "Controller for managing user accounts",
  tags: ["Users"]
})
@Controller('/users')
export class UsersController {
  @OpenApiPatch('/:id')
  @OpenAPI({
    summary: 'Partially update a user',
    description: 'Updates specific fields of an existing user'
  })
  @OpenApiResponseSchema(UpdateUsersDtoRes)
  async patchUser(
    @OpenApiParam('id') id: number,
    @OpenApiBody() body: Partial<UpdateUserDtoReq>
  ): Promise<UpdateUsersDtoRes> {
    // ...
  }
}
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

To generate map:
```bash
curl -X POST http://localhost:3000/api/v1/openapi/generate
```

To generate map using CLI:
```bash
npm run generate:openapi
```

The generated specification will be saved to `openapi/openapi.json` in both cases.

### References

- [routing-controllers](https://www.npmjs.com/package/routing-controllers)
- [routing-controllers-openapi](https://www.npmjs.com/package/routing-controllers-openapi)
- [class-validator](https://www.npmjs.com/package/class-validator)
- [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 