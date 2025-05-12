import express, { Express } from 'express';
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
import { useExpressServer } from 'routing-controllers';
import UsersController from './example.controller';

// Load environment variables
dotenv.config();

// Initialize express app
const app: Express = express();

// Create logger instance
const logger = new CustomLogger();

// Add basic express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger(logger));

// Set up routing-controllers
useExpressServer(app, {
  controllers: [UsersController],
  routePrefix: '/api/v1',
  defaultErrorHandler: false
});

// Add error handler
app.use(errorHandler(logger));

// Serve OpenAPI documentation after routing setup
const openapiPath = path.join(__dirname, '../openapi/openapi.json');
if (fs.existsSync(openapiPath)) {
  // Serve the OpenAPI spec at /api-docs/openapi.json
  app.get('/api-docs/openapi.json', async (req, res) => {
    try {
      // Regenerate OpenAPI spec
      await new Promise((resolve, reject) => {
        const child = require('child_process').exec('npm run generate:openapi');
        child.on('close', (code: number) => code === 0 ? resolve(null) : reject(new Error(`Exit code: ${code}`)));
      });
      
      // Read and serve the fresh spec
      const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
      res.json(openapiSpec);
    } catch (error) {
      logger.error('Failed to regenerate OpenAPI spec:', error);
      // Fallback to existing spec if regeneration fails
      const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
      res.json(openapiSpec);
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