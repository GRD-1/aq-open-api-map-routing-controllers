import { IsString, IsNumber, IsDate } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { ParameterLocation } from 'openapi3-ts';

export const getCustomerByIdDescription = {
  summary: 'Get customer by ID',
  description: 'Retrieves a specific customer by their ID',
  parameters: [{
    in: 'path' as ParameterLocation,
    name: 'id',
    required: true,
    schema: { type: 'number' as const }
  }]
};


export class NestedCustomerFields {
  @IsNumber()
  nestdOne: number;

  @IsString()
  nestedTwo: string;
} 

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

  @IsDate()
  @JSONSchema({
    description: "Nested customer fields",
    $ref: "#/components/schemas/NestedCustomerFieldsAlias"
  })
  nestedFields: NestedCustomerFields;
} 
