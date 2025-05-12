import { IsString, IsEmail, IsNumber, IsDate, IsOptional } from 'class-validator';

export class CreateUserDtoReq {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password_hash: string;

  @IsString()
  name: string;
}

export class CreateUserDtoRes {
  @IsNumber()
  id: number;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsDate()
  @IsOptional()
  last_login_at?: Date | null;

  @IsString()
  password_hash: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
} 
