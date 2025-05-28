import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';
import { CreateUserDtoReq, CreateUserDtoRes } from './create-user.dto';

export const createUsersBulkDescription = {
  summary: 'Create multiple users',
  description: 'Creates multiple users in a single request',
  responses: {
    '400': {
      description: 'Bad Request - Invalid input data',
    },
    '403': {
      description: 'Forbidden',
    },
    '409': {
      description: 'Conflict - One or more users with these emails already exist',
    }
  }
};

export class CreateUsersBulkDtoReq {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDtoReq)
  @JSONSchema({
    description: "Array of users to create",
    type: "array",
    items: { $ref: "#/components/schemas/PostUserReqAlias" },
    example: [{
      email: "user1@example.com",
      password_hash: "$2b$10$...",
      name: "User One"
    }, {
      email: "user2@example.com",
      password_hash: "$2b$10$...",
      name: "User Two"
    }]
  })
  users: CreateUserDtoReq[];
}

@JSONSchema({
  description: "Super puper extra fields object",
  type: "object",
  properties: {
    superPuperExtraFieldOne: {
      type: "string",
      description: "First super puper extra field",
      example: "super puper extra value one"
    },
    superPuperExtraFieldTwo: {
      type: "number",
      description: "Second super puper extra field",
      example: 42
    },
    superPuperExtraFieldThree: {
      type: "boolean",
      description: "Third super puper extra field",
      example: true
    }
  }
})
export class SuperPuperExtraFields {
  @IsString()
  @IsOptional()
  @JSONSchema({
    description: "First super puper extra field",
    type: "string",
    example: "super puper extra value one"
  })
  superPuperExtraFieldOne: string;

  @IsNumber()
  @IsOptional()
  @JSONSchema({
    description: "Second super puper extra field",
    type: "number",
    example: 42
  })
  superPuperExtraFieldTwo: number;

  @IsBoolean()
  @IsOptional()
  @JSONSchema({
    description: "Third super puper extra field",
    type: "boolean",
    example: true
  })
  superPuperExtraFieldThree: boolean;
}

@JSONSchema({
  description: "Super extra fields object",
  properties: {
    superPuperExtraFields: {
      $ref: "#/components/schemas/SuperPuperExtraFieldsAlias"
    }
  }
})
export class SuperExtraFields {
  @IsString()
  @IsOptional()
  superExtraFieldOne: string;

  @IsNumber()
  @IsOptional()
  superExtraFieldTwo: number;

  @IsObject()
  @ValidateNested()
  @Type(() => SuperPuperExtraFields)
  @IsOptional()
  @JSONSchema({
    description: "Super puper extra fields object",
    $ref: "#/components/schemas/SuperPuperExtraFieldsAlias"
  })
  superPuperExtraFields: SuperPuperExtraFields;
}

@JSONSchema({
  description: "Extra fields object",
  type: "object",
  properties: {
    superExtraFields: {
      $ref: "#/components/schemas/SuperExtraFieldsAlias"
    }
  }
})
export class ExtraFields {
  @IsString()
  @IsOptional()
  extraFieldOne: string;

  @IsNumber()
  @IsOptional()
  extraFieldTwo: number;

  @IsObject()
  @ValidateNested()
  @Type(() => SuperExtraFields)
  @IsOptional()
  @JSONSchema({
    description: "Super extra fields object",
    $ref: "#/components/schemas/SuperExtraFieldsAlias"
  })
  superExtraFields: SuperExtraFields;
}

export class CreateUsersBulkDtoRes {
  @JSONSchema({
    description: "Operation status",
    example: "success"
  })
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDtoRes)
  @JSONSchema({
    description: "Array of created users",
    type: "array",
    items: { $ref: "#/components/schemas/PostUserResAlias" },
    example: [{
      id: 1,
      email: "user1@example.com",
      name: "User One",
      last_login_at: null,
      created_at: "2024-03-19T12:00:00.000Z",
      updated_at: "2024-03-19T12:00:00.000Z"
    }, {
      id: 2,
      email: "user2@example.com",
      name: "User Two",
      last_login_at: null,
      created_at: "2024-03-19T12:00:00.000Z",
      updated_at: "2024-03-19T12:00:00.000Z"
    }]
  })
  data: CreateUserDtoRes[];

  @IsObject()
  @ValidateNested()
  @Type(() => ExtraFields)
  @IsOptional()
  @JSONSchema({
    description: "Extra fields object",
    $ref: "#/components/schemas/ExtraFieldsAlias"
  })
  extraFields: ExtraFields;
}
