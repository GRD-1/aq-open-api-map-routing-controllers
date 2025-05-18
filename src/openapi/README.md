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
- [Working with Documentation](#working-with-documentation)
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

### Usage Example

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

## References

- [routing-controllers](https://www.npmjs.com/package/routing-controllers)
- [routing-controllers-openapi](https://www.npmjs.com/package/routing-controllers-openapi)
- [class-validator](https://www.npmjs.com/package/class-validator)
- [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 