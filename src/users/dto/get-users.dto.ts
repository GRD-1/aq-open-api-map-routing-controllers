import { IsString, IsEmail, IsNumber, IsDate, IsOptional } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

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