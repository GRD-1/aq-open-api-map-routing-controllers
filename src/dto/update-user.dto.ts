import { IsString, IsEmail, IsOptional, IsNumber, IsDate } from 'class-validator';

export class UpdateUserDtoReq {
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password_hash?: string;

  @IsString()
  @IsOptional()
  name?: string;
} 

export class UpdateUsersDtoRes {
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