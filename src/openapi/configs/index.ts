import { OpenAPIMapConfig } from '../types';
import { allConfig } from './all.config';
import { usersAndThingsConfig } from './users-and-things.config';
import { customersAndThingsConfig } from './customers-and-things.config';
export const mapConfigs: Record<string, OpenAPIMapConfig> = {
  'all': allConfig,
  'users-and-things': usersAndThingsConfig,
  'customers-and-things': customersAndThingsConfig
}; 