import { Router } from 'express'

import findRoutes from './find'
import referRoutes from './refer'
import config from '../config'
import type { Controllers } from '../controllers'
import type { Services } from '../services'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, services: Services): Router {
  const router = Router()
  const { get } = RouteUtils.actions(router, services.auditService)

  const { dashboardController } = controllers
  get('/', dashboardController.index())

  findRoutes(controllers, services, router)
  if (config.flags.referEnabled) {
    referRoutes(controllers, services, router)
  }

  get('/debug-sentry', (_req, res) => {
    throw new Error('My first Sentry error!')
  })

  return router
}
