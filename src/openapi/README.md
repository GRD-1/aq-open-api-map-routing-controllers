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

4. **Generation Methods**:
   - **Automatic**: The OpenAPI map is automatically generated when the server starts
   - **Manual**: You can generate a new map by making a POST request to `/api/v1/openapi/generate`
   - **CLI**: Run `npm run generate:openapi` to generate the map from command line (the slowest way)

5. **Specification Location**: The generated OpenAPI specification is saved to:
   ```
   ./openapi/openapi.json
   ```

6. **Viewing the Documentation**:
   - Access the Swagger UI at `/api-docs`
   - The UI automatically loads the latest specification
   - All endpoints are grouped by their controller tags
   - Each endpoint shows its parameters, request/response schemas, and examples

## References

- [routing-controllers](https://www.npmjs.com/package/routing-controllers)
- [routing-controllers-openapi](https://www.npmjs.com/package/routing-controllers-openapi)
- [class-validator](https://www.npmjs.com/package/class-validator)
- [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 