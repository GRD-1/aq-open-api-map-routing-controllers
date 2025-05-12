import path, { join } from 'path'

import * as fs from 'fs'

import express, { Express } from 'express'

import compression from 'compression'

import cookieParser from 'cookie-parser'

import passport from 'passport'
import QueryString from 'qs'

import { ControllerBundle, Reef } from 'reef-framework'

import swaggerUi from 'swagger-ui-express'
import { getMetadataArgsStorage } from 'routing-controllers'

import { routingControllersToSpec } from 'routing-controllers-openapi'

import { config } from './config/config'
import db from './database'
import { getLogger, setLogLevel } from './helpers/logger.helper'
import { aqErrorHandler } from './reef-extends/error-handler'
import { AqCasters } from './reef-extends/aq-casters.class'
import { AqMiddlewareGenerator } from './reef-extends/aq-middleware-generator.class'
import { traceIdGenerator } from './reef-extends/trace-id'

import worker from './workers/PgBoss'
import { setupCORS } from './cors'
import { setupHTTPHeaders } from './HTTPHeaders'
import { downloadMockingSchema, initDocs } from './utilities/jsdocSetup'
import PublicDataSourceController from './controllers-public-api/productController'

let app: Express

// TODO: Evaluate and remove it later on
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function gracefulShutdown() {
  // @ts-ignore
  const { sequelize } = app._aq

  if (sequelize) {
    await sequelize.close()
  } else {
    console.warn('Cannot find sequelize instance to close connection pools')
  }
  if (worker) {
    await worker.deleteAllQueues()
    await worker.clearStorage()
    await worker.purge()
    await worker.stop()
  } else {
    console.warn('Cannot find worker instance to close connection pools')
  }

  console.info('DB connection pools dropped...')
  process.exit(0)
}

function serveFrontend(eapp: Express) {
  if (config.deployedEnvironment || (config.isE2eTesting && !config.isE2eTestingWatching)) {
    console.info('☕️ Serving frontend build through server')
    // Serve our built frontend files

    // Working for production container is /app/build
    // - (files are copied to /build and we run the server from there)
    // Working directory for e2e (and local dev) is /app
    // Therefore the served path for production doesn't need to contain the build directory
    const basePath = config.isE2eTesting ? 'build/client/dist' : 'client/dist'

    eapp.use(express.static(basePath, { index: false }))

    eapp.get(/^(?!\/(api|assets)\/).*/, (request, response) => {
      response.sendFile(path.resolve(process.cwd(), `${basePath}/index.html`))
    })

    // make the public folder publicly available
    eapp.use(express.static('public', { index: false }))
  }
}

export const API_BASE_ROUTES = {
  INTERNAL: '/api/v1/',
  TEST: '/test',
  SSO: '/sso/',
  PUBLIC: '/api/public/v1',
  ADVISOR: '/api/v1',
}

export async function initializeServer(bindToPort: boolean) {
  const logger = getLogger('ServerMain')
  if (bindToPort) setLogLevel(10)

  const controllerBundle: ControllerBundle = {
    name: 'internal-api',
    controllerDirPath: join(__dirname, 'controllers-internal-api'),
    baseRoute: API_BASE_ROUTES.INTERNAL,
    controllerFileNamePattern: /(\.controller|Controller)\.(ts|js)/g,
  }

  const testingControllerBundle: ControllerBundle = {
    name: 'testing',
    controllerDirPath: join(__dirname, 'controllers-testing'),
    baseRoute: API_BASE_ROUTES.TEST,
    controllerFileNamePattern: /\.controller\.(ts|js)/g,
  }

  const ssoControllerBundle: ControllerBundle = {
    name: 'sso',
    controllerDirPath: join(__dirname, 'controllers-sso'),
    baseRoute: API_BASE_ROUTES.SSO,
    controllerFileNamePattern: /\.controller\.(ts|js)/g,
  }

  const apiPublicControllerBundle: ControllerBundle = {
    name: 'apiPublic',
    controllerDirPath: join(__dirname, 'controllers-public-api'),
    baseRoute: API_BASE_ROUTES.PUBLIC,
    controllerFileNamePattern: /(\.controller|Controller)\.(ts|js)/g,
  }

  const advisorAppControllerBundle: ControllerBundle = {
    name: 'advisorApp',
    controllerDirPath: join(__dirname, 'controllers-advisor-app'),
    baseRoute: API_BASE_ROUTES.ADVISOR,
    controllerFileNamePattern: /(\.controller|Controller)\.(ts|js)/g,
  }
  app = express()

  // @ts-ignore
  app._aq = {
    worker,
  }
  app.enable('trust proxy')
  app.set('x-powered-by', false)
  app.set('query parser', (str: string) => {
    return QueryString.parse(str, { arrayLimit: 1000 })
  })
  app.use(passport.initialize())
  app.use(cookieParser())

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // app.oauth = new OAuthServer({ model: oauthModel, useErrorHandler: true })

  initDocs(app)

  setupCORS(app)
  setupHTTPHeaders(app)
  const reef = new Reef(app)
  reef
    .preRun(db.init)
    .postRun(serveFrontend)
    .setGlobalMiddleware(express.json({ limit: '10mb' }))
    .setGlobalMiddleware(express.urlencoded({ extended: true }))
    .defineParamCaster(AqCasters)
    .setControllerBundle(controllerBundle)
    .setControllerBundle(ssoControllerBundle)
    .setControllerBundle(apiPublicControllerBundle)
    .setControllerBundle(advisorAppControllerBundle)
    .addErrorHandler(aqErrorHandler)
    .setLoggerFn(getLogger)
    .setMiddlewareGenerator(AqMiddlewareGenerator)
    .setTraceIdFn(traceIdGenerator)

  if (config.isTesting) reef.setControllerBundle(testingControllerBundle)

  if (config.deployedEnvironment || config.isE2eTesting) {
    app.use(compression())
  }
  app.get('/status', (_, res) => {
    res.status(200)
    res.send('Healthy')
  })

  await reef.launch()

  if (config.isProduction) {
    app.get('/designsystem', (_, res) => res.redirect('/'))
  }
  app.get('/test/health/ezuwx75h4n0t6k6b7mx2qztw032zjw8e', (req, res) => {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    const { Client } = require('pg')
    const connectionString = `postgres://${config.db.user}:${config.db.password}@${process.env.DB_NEW_CONN || 'localhost'}:${config.db.port}/${config.db.database}`
    console.log({ connectionString })
    const client = new Client({
      connectionString,
    })

    client.connect()

    client.query(
      `SELECT * FROM ${config.db.schemaMain}.users where email = 'david+clone@altruistiq.com' LIMIT 1`,
      (err, resp) => {
        if (err) {
          console.error(err)
        } else {
          console.log(resp.rows)
        }
        client.end()
      },
    )
    res.send('SUCCESS')
  })

  if (config.isE2eTestingWatching) {
    app.get('/', (_, res) => {
      res.status(200)
      res.send('Healthy')
    })
  }

  // Set up routing-controllers metadata for OpenAPI generation
  const storage = getMetadataArgsStorage()
  const spec = routingControllersToSpec(storage, {
    controllers: [PublicDataSourceController],
    routePrefix: '/api/v1',
  })

  // Write the spec to file for the generate:openapi script
  fs.writeFileSync(path.join(__dirname, '../public/openapi/openapi.json'), JSON.stringify(spec, null, 2))

  // Serve OpenAPI documentation after routing setup
  const openapiPath = path.join(__dirname, '../public/openapi/openapi.json')
  if (fs.existsSync(openapiPath)) {
    // Serve the OpenAPI spec at /api-docs/openapi.json
    app.get('/api-docs/openapi.json', async (req, res) => {
      try {
        // Regenerate OpenAPI spec
        await new Promise((resolve, reject) => {
          // eslint-disable-next-line global-require
          const child = require('child_process').exec('npm run generate:openapi')
          child.on('close', (code: number) => (code === 0 ? resolve(null) : reject(new Error(`Exit code: ${code}`))))
        })

        // Read and serve the fresh spec
        const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'))
        res.json(openapiSpec)
      } catch (error) {
        logger.error('Failed to regenerate OpenAPI spec:', error)
        // Fallback to existing spec if regeneration fails
        const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'))
        res.json(openapiSpec)
      }
    })

    // Serve Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(null, {
        swaggerOptions: {
          url: '/api-docs/openapi.json',
        },
      }),
    )

    logger.info('OpenAPI documentation is available at /api-docs')
  } else {
    logger.warn('OpenAPI specification file not found. Run npm run generate:openapi to generate it.')
  }

  if (bindToPort) {
    app.listen(config.server.port, () => {
      logger.info(
        { port: Number(config.server.port) },
        `👉 Server running on http://localhost:${config.server.port} 🚀`,
      )
    })
  }

  downloadMockingSchema()

  return app
}

if (!config.isTesting)
  process
    .on('unhandledRejection', (reason, p) => {
      console.error(reason, 'Unhandled Rejection at Promise', p)
    })
    .on('uncaughtException', err => {
      console.warn(err)
    })
    // .on('SIGINT', async () => {
    //   console.info('Received SIGINT. Dropping DB connection pools...')
    //   await gracefulShutdown()
    // })
    // .on('SIGTERM', async () => {
    //   console.info('Received SIGTERM. Dropping DB connection pools...')
    //   await gracefulShutdown()
    // })
    .on('warning', warning => {
      console.warn(warning.name) // Print the warning name
      console.warn(warning.message) // Print the warning message
      console.warn(warning.stack) // Print the stack trace
    })

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error.stack)
})

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason)
})
