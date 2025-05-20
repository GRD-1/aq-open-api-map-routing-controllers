import { OpenAPIMapConfig } from '../types';
import ThingsController from '../../things/things.controller';
import CustomersController from '../../customers/customers.controller';
import path from 'path';

export const customersAndThingsConfig: OpenAPIMapConfig = {
  controllers: [
    ThingsController,
    CustomersController
  ],
  info: {
    title: 'AQ Open API Map - Customers and Things Controllers',
    version: '1.0.0',
    description: 'API documentation for Customers and Things controllers'
  },
  outputPath: path.join(process.cwd(), 'openapi', 'customers-and-things.json')
}; 