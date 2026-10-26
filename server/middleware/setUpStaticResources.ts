import compression from 'compression'
import type { Router } from 'express'
import express from 'express'
import noCache from 'nocache'
import path from 'path'

import config from '../config'

export default function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  // redirect is disabled so that missing folders return a 404 rather than a 301 without a CSP header
  const staticResourcesConfig = { maxAge: config.staticResourceCacheDuration * 1000, redirect: false }

  Array.of(
    '/assets',
    '/assets/stylesheets',
    '/assets/js',
    '/node_modules/govuk-frontend/dist/govuk/assets',
    '/node_modules/govuk-frontend/dist',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
  ).forEach(dir => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), staticResourcesConfig))
  })

  Array.of('/node_modules/jquery/dist/jquery.min.js').forEach(dir => {
    router.use('/assets/js/jquery.min.js', express.static(path.join(process.cwd(), dir), staticResourcesConfig))
  })

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
