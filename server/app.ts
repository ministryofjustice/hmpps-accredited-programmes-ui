import express from 'express'
import createError from 'http-errors'
import path from 'path'

import errorHandler from './errorHandler'
import {
  authorisationMiddleware,
  setUpAuthentication,
  setUpCsrf,
  setUpCurrentUser,
  setUpHealthChecks,
  setUpSentryErrorHandler,
  setUpSentryRequestHandler,
  setUpStaticResources,
  setUpWebRequestParsing,
  setUpWebSecurity,
  setUpWebSession,
} from './middleware'
import { metricsMiddleware } from './monitoring/metricsApp'
import routes from './routes'
import { nunjucksSetup } from './utils'

export default function createApp(): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  // The Sentry request handler must be the first middleware on the app
  setUpSentryRequestHandler(app)

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, path)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())

  app.use(routes)

  app.use((_req, _res, next) => next(createError(404, 'Not found')))
  // The Sentry error handler must be before any other error middleware and after all controllers
  setUpSentryErrorHandler(app)
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
