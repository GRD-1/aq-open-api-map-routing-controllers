import express, { Express, Request } from 'express';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger, requestLogger } from './logger';
import { testConnection } from './database';
import './database/models';  // Initialize models
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error-handler.middleware';
import { Reef } from 'reef-framework';
import OpenAPIController from './openapi/openapi.controller';
import swaggerUi from 'swagger-ui-express';
import { useExpressServer } from 'routing-controllers';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = new CustomLogger();

// Create Express application
const app: Express = express();

// Extend Request type to include id
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

// Add request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Add request logging middleware
app.use(requestLogger(logger));

// Parse JSON bodies
app.use(express.json());

// Setup Swagger UI
app.use('/api/v1/openapi/ui', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: {
    url: '/api/v1/openapi/json',
    persistAuthorization: true
  }
}));

// Initialize Reef framework
const reef = new Reef(app);

// Set up controller bundle
reef.setControllerBundle({
  name: 'api',
  controllerDirPath: join(__dirname),
  baseRoute: '/api/v1/',
  controllerFileNamePattern: /\.controller\.(ts|js)$/g,
});

// Set up logger
reef.setLoggerFn(() => logger);

// Set up trace ID
reef.setTraceIdFn((req) => req.header('X-Trace-Id') || uuidv4());

// Set up error handler
reef.addErrorHandler(errorHandler);

// Initialize controllers for OpenAPI documentation
useExpressServer(app, {
  controllers: [OpenAPIController],
  routePrefix: '/api/v1',
  defaultErrorHandler: false,
  middlewares: []
});

// Launch reef framework
reef.launch();

// Launch the application
const PORT = process.env.PORT || 3000;

// Test database connection and start server
const start = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info('OpenAPI documentation is available at /api/v1/openapi/ui');
    });
  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
};

start(); 