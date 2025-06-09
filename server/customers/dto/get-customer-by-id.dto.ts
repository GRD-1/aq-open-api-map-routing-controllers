import { IsNumber, IsString, IsDate } from 'class-validator';

export class GetCustomerByIdDtoRes {
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