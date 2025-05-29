import { IsString, IsEmail, IsNumber, IsDate, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { ParameterLocation } from 'openapi3-ts';

export class GetUsersQueryDto {
  @IsString()
  @IsOptional()
  @JSONSchema({
    description: 'Filter users by name (partial match)',
    example: 'John'
  })
  name?: string;

  @IsString()
  @IsOptional()
  @JSONSchema({
    description: 'Filter users by email (partial match)',
    example: 'john@example.com'
  })
  email?: string;

  @IsString()
  @IsOptional()
  @JSONSchema({
    description: 'ravoly ravolu ravoly',
    example: 'ravoly!!!'
  })
  ravoly?: string;
}

export const getAllUsersDescription = {
  summary: 'Get all users',
  description: 'Retrieves a list of all users in the system',
};

export const getUserByIdDescription = {
  summary: 'Get user by ID',
  description: 'Retrieves a specific user by their ID',
  parameters: [{
    in: 'path' as ParameterLocation,
    name: 'id',
    required: true,
    schema: { type: 'number' as const }
  }]
};

export class GetUsersDtoReq {
  @IsNumber()
  @JSONSchema({
    description: 'Unique identifier of the user to retrieve',
    example: 1
  })
  id: number;
} 

export class GetUsersDtoRes {
  @IsNumber()
  @JSONSchema({
    description: 'Unique identifier of the user',
    example: 1
  })
  id: number;

  @IsString()
  @IsEmail()
  @JSONSchema({
    description: 'Email address of the user',
    example: 'user@example.com'
  })
  email: string;

  @IsString()
  @JSONSchema({
    description: 'Full name of the user',
    example: 'John Doe'
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
    description: 'Hashed password for user authentication',
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
    example: '2024-03-15T10:00:00Z'
  })
  updated_at: Date;
} 