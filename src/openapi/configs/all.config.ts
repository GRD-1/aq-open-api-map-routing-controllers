import { OpenAPIMapConfig } from '../types';
import UsersController from '../../users/user.controller';
import ThingsController from '../../things/things.controller';
import CustomersController from '../../customers/customers.controller';
import path from 'path';

export const allConfig: OpenAPIMapConfig = {
  controllers: [
    UsersController,
    ThingsController,
    CustomersController
  ],
  info: {
    title: 'AQ Open API Map - All Controllers',
    version: '1.0.0',
    description: 'API documentation for all available controllers'
  },
  outputPath: path.join(process.cwd(), 'openapi', 'all.json')
}; 