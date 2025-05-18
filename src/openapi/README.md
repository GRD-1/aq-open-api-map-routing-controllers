# OpenAPI Documentation Guide

This document provides an overview of the tool that generates OpenAPI map based on decorators that we are using in this project. This tool based on the [routing-controllers](https://www.npmjs.com/package/routing-controllers) library. 

All decorators we use are prefixed with `OpenApi` for consistency and compatibility with reef-framework.

For typing the fields in DTOs we use [class-validator](https://www.npmjs.com/package/class-validator) decorators, for descriptions in DTOs - [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 

## Table of Contents

- [Overview](#openapi-documentation-guide)
- [Decorators](#controller-decorators)
  - [Controller Decorators](#controller-decorators)
  - [Method Decorators](#method-decorators)
  - [Parameter Decorators](#parameter-decorators)
  - [Response Schema Decorator](#response-schema-decorator)
- [Usage Example](#usage-example)
- [Generate OpenAPI Map](#generate-openapi-map)
- [References](#references)



### Controller Decorators
```typescript
@OpenApiJsonController('/users')
@OpenApiControllerDesc({
  description: "Controller for managing user accounts",
  tags: ["Users"]
})
```

### Method Decorators
```typescript
@OpenApiGet('/users')
@OpenApiPost('/users')
@OpenApiPut('/users/:id')
@OpenApiPatch('/users/:id')
@OpenApiDelete('/users/:id')
```

### Parameter Decorators
```typescript
@OpenApiBody()
@OpenApiParam('id')
@OpenApiReq()
@OpenApiRes()
```

### Response Schema Decorator
```typescript
@OpenApiResponseSchema(UserResponseDto)
```

## Usage Example

```typescript
@OpenApiJsonController('/users')
@OpenApiControllerDesc({
  description: "Controller for managing user accounts",
  tags: ["Users"]
})
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

## Generate OpenAPI Map

The OpenAPI map is generated from your controllers and DTOs using the decorators described above. Here's how to generate and use the map:

1. **Generation Methods**:
   - **API Endpoint**: Make a POST request to `/api/v1/openapi/generate` (fastest)
   - **CLI Command**: Run `npm run generate:openapi` (slower but useful for CI/CD)

2. **Specification Location**: The generated OpenAPI specification is saved to:
   ```
   ./openapi/openapi.json
   ```

3. **Viewing the Documentation**:
   - Access the Swagger UI at `/api-docs`
   - The UI loads the latest generated specification
   - All endpoints are grouped by their controller tags
   - Each endpoint shows its parameters, request/response schemas, and examples

4. **When to Generate**:
   - After adding new controllers or modifying existing ones
   - After changing DTO schemas or validation rules
   - When updating API documentation or descriptions
   - Before deploying new API versions

## References

- [routing-controllers](https://www.npmjs.com/package/routing-controllers)
- [routing-controllers-openapi](https://www.npmjs.com/package/routing-controllers-openapi)
- [class-validator](https://www.npmjs.com/package/class-validator)
- [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 