/* eslint-disable no-param-reassign */
import type express from 'express'
import nunjucks from 'nunjucks'
import type * as pathModule from 'path'

import StringUtils from './stringUtils'
import config from '../config'
import { findPaths, referPaths } from '../paths'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Accredited Programmes'
  app.locals.enableApplicationInsights = config.enableApplicationInsights
  app.locals.applicationInsightsConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || ''

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  app.use((req, res, next) => {
    res.locals.currentPath = req.originalUrl
    res.locals.referEnabled = config.flags.referEnabled
    return next()
  })

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addFilter('initialiseName', StringUtils.initialiseName)

  njkEnv.addGlobal('findPaths', findPaths)
  njkEnv.addGlobal('referPaths', referPaths)
}
