import { Router } from 'express'

import findRoutes from './find'
import type { Controllers } from '../controllers'
import actions from '../utils/routeUtils'

export default function routes(controllers: Controllers): Router {
  const router = Router()
  const { get, post } = actions(router)

  const { dashboardController, cookiePolicyController } = controllers
  get('/', dashboardController.index())

  get('/cookie-policy', cookiePolicyController.index())
  post('/cookie-preferences', cookiePolicyController.update())

  findRoutes(controllers, router)

  get('/debug-sentry', (_req, res) => {
    throw new Error('My first Sentry error!')
  })

  return router
}
