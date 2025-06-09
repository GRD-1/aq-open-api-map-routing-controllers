import { IsString, IsEmail, IsNumber } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

export const loginDescription = {
  summary: 'User login',
  description: 'Authenticates a user and returns access tokens',
  responses: {
    '401': {
      description: 'Unauthorized - Invalid credentials',
    }
  }
};

export class LoginRequestDto {
  @IsString()
  @IsEmail()
  @JSONSchema({
    description: 'User email address, must be a valid email format',
    example: 'user@example.com'
  })
  email: string;

  @IsString()
  @JSONSchema({
    description: 'Hashed password for user authentication',
    example: '$2b$10$...'
  })
  password_hash: string;
}

export class LoginResponseDto {
  @IsString()
  @JSONSchema({
    description: 'Access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @IsString()
  @JSONSchema({
    description: 'Refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refresh_token: string;

  @IsNumber()
  @JSONSchema({
    description: 'Token expiration time in seconds',
    example: 15552000
  })
  expires_in: number;
} 