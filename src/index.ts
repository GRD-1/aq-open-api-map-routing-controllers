import express, { Express, Request } from 'express';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger, requestLogger } from './logger';
import { testConnection } from './database';
import './database/models';  // Initialize models
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error-handler.middleware';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import { Reef } from 'reef-framework';
import UsersController from './user.controller';

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

// Launch reef framework
reef.launch();

// Serve OpenAPI documentation
const openapiPath = path.join(__dirname, '../openapi/openapi.json');
if (fs.existsSync(openapiPath)) {
  // Serve the OpenAPI spec at /api-docs/openapi.json
  app.get('/api-docs/openapi.json', (req, res) => {
    try {
      const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
      res.json(openapiSpec);
    } catch (error) {
      logger.error('Failed to read OpenAPI spec:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to read OpenAPI specification'
      });
    }
  });

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
    swaggerOptions: {
      url: '/api-docs/openapi.json'
    }
  }));
  
  logger.info('OpenAPI documentation is available at /api-docs');
} else {
  logger.warn('OpenAPI specification file not found. Run npm run generate:openapi to generate it.');
}

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
    });
  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
};

start(); 