import express, { Express } from 'express';
import { Reef } from 'reef-framework';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger, requestLogger } from './logger';
import { testConnection } from './database';
import './database/models';  // Initialize models
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error-handler.middleware';

// Load environment variables
dotenv.config();

// Initialize express app
const app: Express = express();
const reef = new Reef(app);

// Create logger instance
const logger = new CustomLogger();

// Add global middleware
reef.setGlobalMiddleware(express.json());
reef.setGlobalMiddleware(express.urlencoded({ extended: false }));
reef.setGlobalMiddleware(requestLogger(logger));

// Set up controller bundle
reef.setControllerBundle({
  name: 'api',
  controllerDirPath: join(__dirname),
  baseRoute: '/api/v1/',
  controllerFileNamePattern: /(\.controller|Controller)\.(ts|js)/g,
});

// Set up logger
reef.setLoggerFn(() => logger);

// Set up trace ID
reef.setTraceIdFn((req) => req.header('X-Trace-Id') || uuidv4());

// Set up error handler
reef.addErrorHandler(errorHandler(logger));

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

    // Launch reef framework
    reef.launch();
  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
};

start(); 