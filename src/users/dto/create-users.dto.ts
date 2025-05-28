import { IsArray, ValidateNested } from 'class-validator';
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
    items: { $ref: "#/components/schemas/CreateUserDtoReq" },
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
} 