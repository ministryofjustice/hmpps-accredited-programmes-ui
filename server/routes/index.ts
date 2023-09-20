import { Router } from 'express'

import findRoutes from './find'
import referRoutes from './refer'
import type { Controllers } from '../controllers'
import Routes from '../utils/routeBuilder'

export default function routes(controllers: Controllers): Router {
  const router = Router()

  return Routes.forAnyRole()
    .get('/', controllers.dashboardController.index())
    .use(findRoutes(controllers, router))
    .use(referRoutes(controllers))
    .get('/debug-sentry', (_req, res) => {
      throw new Error('My first Sentry error!')
    })
    .build()
}
