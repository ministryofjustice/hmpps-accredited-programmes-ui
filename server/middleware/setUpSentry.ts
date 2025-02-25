import * as Sentry from '@sentry/node'
import type express from 'express'

import { gitRef } from '../applicationVersion'
import config from '../config'

export default function setUpSentry(app: express.Express): void {
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
      release: gitRef,
      tracesSampler: samplingContext => {
        const samplingContextName = samplingContext.name
        if (
          samplingContextName?.includes('ping') ||
          samplingContextName?.includes('health') ||
          samplingContextName?.includes('assets')
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
    Sentry.setupExpressErrorHandler(app)
  }
}
