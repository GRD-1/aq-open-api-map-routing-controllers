import { IsString, IsNumber } from 'class-validator';

export class GetCustomerRequisitesDtoRes {
  @IsString()
  bank_name: string;

  @IsString()
  bank_account: string;

  @IsString()
  bank_code: string;

  @IsString()
  tax_id: string;

  @IsString()
  company_name: string;

  @IsString()
  company_address: string;

  @IsNumber()
  customer_id: number;
} 