import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import OpenApiController from './open-api/open-api.controller';
import UsersController from './users/user.controller';
import ThingsController from './things/things.controller';
import CustomersController from './customers/customers.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { sequelize } from './database';
import { CustomLogger } from './logger';

const logger = new CustomLogger();

const app = createExpressServer({
  controllers: [OpenApiController, UsersController, ThingsController, CustomersController],
  middlewares: [AuthMiddleware, errorHandler(logger)],
  defaultErrorHandler: false,
  validation: true,
  classTransformer: true
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('OpenAPI documentation is available at /api/v1/openapi/ui');
});

export default app; 