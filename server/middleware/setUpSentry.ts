import * as Sentry from '@sentry/node'
import type express from 'express'

import applicationVersion from '../applicationVersion'
import config from '../config'

function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler)
  }
}

function setUpSentryRequestHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.environment,
      release: applicationVersion.gitRef,
    })
    app.use(
      Sentry.Handlers.requestHandler({
        ip: false,
        user: false,
      }) as express.RequestHandler,
    )
  }
}

export { setUpSentryErrorHandler, setUpSentryRequestHandler }
