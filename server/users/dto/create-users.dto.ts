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
    items: { $ref: "#/components/schemas/PostUserReqAlias" },
  })
  users: CreateUserDtoReq[];
}

export class SuperPuperExtraFields {
  @IsString()
  @IsOptional()
  superPuperExtraFieldOne: string;

  @IsNumber()
  @IsOptional()
  superPuperExtraFieldTwo: number;

  @IsBoolean()
  @IsOptional()
  superPuperExtraFieldThree: boolean;
}

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
    $ref: "#/components/schemas/SuperPuperExtraFields"
  })
  superPuperExtraFields: SuperPuperExtraFields;
}

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
    $ref: "#/components/schemas/SuperExtraFields"
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
    items: { $ref: "#/components/schemas/CreateUserDtoRes" },
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
    $ref: "#/components/schemas/ExtraFields"
  })
  extraFields: ExtraFields;
}
