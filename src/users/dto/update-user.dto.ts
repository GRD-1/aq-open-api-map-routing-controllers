import { IsString, IsEmail, IsOptional, IsNumber, IsDate } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { ParameterLocation } from 'openapi3-ts';

export const updateUserDescription = {
  summary: 'Update a user',
  description: 'Updates an existing user with the provided data',
  parameters: [{
    in: 'path' as ParameterLocation,
    name: 'id',
    required: true,
    schema: { type: 'number' as const }
  }]
};

export const patchUserDescription = {
  summary: 'Partially update a user',
  description: 'Updates specific fields of an existing user',
  parameters: [{
    in: 'path' as ParameterLocation,
    name: 'id',
    required: true,
    schema: { type: 'number' as const }
  }]
};

export class UpdateUserDtoReq {
  @IsString()
  @IsEmail()
  @IsOptional()
  @JSONSchema({
    description: 'User email address to update, must be a valid email format',
    example: 'updated@example.com'
  })
  email?: string;

  @IsString()
  @IsOptional()
  @JSONSchema({
    description: 'New hashed password for user authentication',
    example: '$2b$10$...'
  })
  password_hash?: string;

  @IsString()
  @IsOptional()
  @JSONSchema({
    description: 'New full name of the user',
    example: 'John Updated Doe'
  })
  name?: string;
} 

export class UpdateUsersDtoRes {
  @IsNumber()
  @JSONSchema({
    description: 'Unique identifier of the updated user',
    example: 1
  })
  id: number;

  @IsString()
  @IsEmail()
  @JSONSchema({
    description: 'Updated email address of the user',
    example: 'updated@example.com'
  })
  email: string;

  @IsString()
  @JSONSchema({
    description: 'Updated full name of the user',
    example: 'John Updated Doe'
  })
  name: string;

  @IsDate()
  @IsOptional()
  @JSONSchema({
    description: 'Date and time of the last user login, can be null',
    example: '2024-03-15T10:30:00Z'
  })
  last_login_at?: Date | null;

  @IsString()
  @JSONSchema({
    description: 'Updated hashed password for user authentication',
    example: '$2b$10$...'
  })
  password_hash: string;

  @IsDate()
  @JSONSchema({
    description: 'Timestamp when the user account was created',
    example: '2024-03-15T10:00:00Z'
  })
  created_at: Date;

  @IsDate()
  @JSONSchema({
    description: 'Timestamp when the user account was last updated',
    example: '2024-03-15T10:30:00Z'
  })
  updated_at: Date;
} 