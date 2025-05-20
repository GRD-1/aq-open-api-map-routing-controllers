import { OpenAPIMapConfig } from '../types';
import UsersController from '../../users/user.controller';
import ThingsController from '../../things/things.controller';
import path from 'path';

export const usersAndThingsConfig: OpenAPIMapConfig = {
  controllers: [
    UsersController,
    ThingsController
  ],
  info: {
    title: 'AQ Open API Map - Users and Things',
    version: '1.0.0',
    description: 'API documentation for Users and Things controllers'
  },
  outputPath: path.join(process.cwd(), 'openapi', 'users-and-things.json')
}; 