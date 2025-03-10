/* istanbul ignore file */

import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import express from 'express'
import createError from 'http-errors'
import methodOverride from 'method-override'
import path from 'path'

import config from './config'
import type { Controllers } from './controllers'
import errorHandler from './errorHandler'
import {
  authorisationMiddleware,
  setUpAuthentication,
  setUpCsrf,
  setUpCurrentUser,
  setUpEnvironmentName,
  setUpHealthChecks,
  setUpSentry,
  setUpStaticResources,
  setUpWebRequestParsing,
  setUpWebSecurity,
  setUpWebSession,
} from './middleware'
import { metricsMiddleware } from './monitoring/metricsApp'
import routes from './routes'
import type { Services } from './services'
import { nunjucksSetup } from './utils'

export default function createApp(controllers: Controllers, services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(methodOverride('_method'))

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  setUpEnvironmentName(app)
  nunjucksSetup(app, path)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser(services))
  app.get('*', dpsComponents.getPageComponents({ dpsUrl: config.dpsUrl }))
  app.use(routes(controllers))

  // The Sentry middleware must be before any other error middleware and after all controllers
  setUpSentry(app)

  app.use((req, res, next) => next(createError(404, 'Not Found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
