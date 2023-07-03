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
  // Prevent usernames which are PII from being sent to Sentry
  // https://docs.sentry.io/platforms/python/guides/logging/data-management/sensitive-data/#examples
  const anonymousId = Math.random().toString()
  Sentry.setUser({ id: anonymousId, username: anonymousId })

  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.environment,
      release: applicationVersion.gitRef,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
      ],
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
