import { IsString, IsNumber, IsDate } from 'class-validator';

export class GetCustomersDtoRes {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
} 