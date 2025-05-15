# OpenAPI Documentation Guide

This document provides an overview of the tool that generates OpenAPI map based on decorators that we are using in this project. This tool based on the [routing-controllers](https://www.npmjs.com/package/routing-controllers) library. 

All decorators we use are prefixed with `OpenApi` for consistency and compatibility with reef-framework.

For typing the fields in DTOs we use [class-validator](https://www.npmjs.com/package/class-validator) decorators, for descriptions in DTOs - [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 


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

## References

- [routing-controllers](https://www.npmjs.com/package/routing-controllers)
- [routing-controllers-openapi](https://www.npmjs.com/package/routing-controllers-openapi)
- [class-validator](https://www.npmjs.com/package/class-validator)
- [class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema) 