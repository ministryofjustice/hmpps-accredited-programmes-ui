import { Router } from 'express'

import assessRoutes from './assess'
import editorRoutes from './editor'
import findRoutes from './find'
import referRoutes from './refer'
import reportsRoutes from './reports'
import config from '../config'
import type { Controllers } from '../controllers'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers): Router {
  const router = Router()
  const { get } = RouteUtils.actions(router)

  const { dashboardController } = controllers
  get('/', dashboardController.index())
  get('/accessibility-statement', dashboardController.accessibilityStatement())

  editorRoutes(controllers, router)
  findRoutes(controllers, router)
  reportsRoutes(controllers, router)
  if (config.flags.referEnabled) {
    assessRoutes(controllers, router)
    referRoutes(controllers, router)
  }

  get('/debug-sentry', (_req, res) => {
    throw new Error('My first Sentry error!')
  })

  return router
}
