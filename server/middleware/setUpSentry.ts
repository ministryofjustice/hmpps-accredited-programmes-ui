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
  Sentry.setUser({ id: anonymousId })

  if (config.sentry.dsn) {
    Sentry.init({
      beforeSend(event) {
        if (event.user) {
          // Don't send username
          // eslint-disable-next-line no-param-reassign
          delete event.user.username
        }
        return event
      },
      dsn: config.sentry.dsn,
      environment: config.environment,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
      ],
      release: applicationVersion.gitRef,
      tracesSampler: samplingContext => {
        const transactionName = samplingContext?.transactionContext?.name
        if (
          transactionName?.includes('ping') ||
          transactionName?.includes('health') ||
          transactionName?.includes('assets')
        ) {
          return 0
        }

        if (config.environment === 'prod') {
          return 1
        }

        // Default sample rate
        return 0.05
      },
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
