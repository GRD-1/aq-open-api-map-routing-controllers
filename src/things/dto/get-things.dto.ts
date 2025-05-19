import { IsString, IsNumber, IsDate } from 'class-validator';
import { OpenAPI } from 'routing-controllers-openapi';

export class GetThingsDtoRes {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}

// Add OpenAPI schema
OpenAPI({
  schema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'The unique identifier of the thing' },
      name: { type: 'string', description: 'The name of the thing' },
      description: { type: 'string', description: 'A description of the thing' },
      created_at: { type: 'string', format: 'date-time', description: 'When the thing was created' },
      updated_at: { type: 'string', format: 'date-time', description: 'When the thing was last updated' }
    }
  }
})(GetThingsDtoRes); 