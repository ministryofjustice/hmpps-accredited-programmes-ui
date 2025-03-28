/* eslint-disable no-param-reassign */

// eslint-disable-next-line import/extensions
import mojFrontendFilters from '@ministryofjustice/frontend/moj/filters/all.js'
import type express from 'express'
import nunjucks from 'nunjucks'
import type * as pathModule from 'path'

import NunjucksUtils from './nunjucksUtils'
import StringUtils from './stringUtils'
import config from '../config'
import { findPaths, referPaths } from '../paths'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Accredited Programmes'
  app.locals.dpsUrl = config.dpsUrl
  app.locals.feedbackUrl = 'https://www.smartsurvey.co.uk/s/UWK3UY/'
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
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addFilter('initialiseName', StringUtils.initialiseName)
  njkEnv.addFilter('objectMerge', NunjucksUtils.objectMerge)
  njkEnv.addFilter('makePossessive', StringUtils.makePossessive)

  njkEnv.addGlobal('findPaths', findPaths)
  njkEnv.addGlobal('referPaths', referPaths)

  njkEnv.addFilter('mojDate', mojFrontendFilters().mojDate)
}
