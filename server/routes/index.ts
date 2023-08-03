import { Router } from 'express'

import findRoutes from './find'
import type { Controllers } from '../controllers'
import { routeUtils } from '../utils'

export default function routes(controllers: Controllers): Router {
  const router = Router()
  const { get } = routeUtils.actions(router)

  const { dashboardController } = controllers
  get('/', dashboardController.index())

  findRoutes(controllers, router)

  get('/debug-sentry', (_req, res) => {
    throw new Error('My first Sentry error!')
  })

  return router
}
