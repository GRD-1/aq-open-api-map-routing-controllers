import express from 'express';
import { join } from 'path';
import { useExpressServer } from 'routing-controllers';
import { Reef } from 'reef-framework';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger } from './logger';
import { errorHandler } from './middleware/error-handler.middleware';
import { testConnection } from './database';
import OpenApiController from './open-api/open-api.controller';
import * as swaggerUi from 'swagger-ui-express';

// Create Express app
const app = express();

// Initialize logger
const logger = new CustomLogger();

// Parse JSON bodies
app.use(express.json());

// Initialize Swagger UI middleware
app.use('/api/v1/openapi/ui', swaggerUi.serve);
app.get('/api/v1/openapi/ui', (req, res, next) => {
  const mapName = req.query.mapName || 'all';
  const setupHandler = swaggerUi.setup(null, {
    swaggerOptions: {
      url: `/api/v1/openapi/json?mapName=${mapName}`
    }
  });
  setupHandler(req, res, next);
});

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
  controllers: [OpenApiController],
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