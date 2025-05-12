import { IsString, IsEmail, IsNumber, IsDate, IsOptional } from 'class-validator';

export class GetUsersDtoReq {
  @IsNumber()
  id: number;
} 

export class GetUsersDtoRes {
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