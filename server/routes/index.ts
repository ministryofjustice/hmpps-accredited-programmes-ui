import { Router } from 'express'

import findRoutes from './find'
import type { Controllers } from '../controllers'
import actions from '../utils/routeUtils'

export default function routes(controllers: Controllers): Router {
  const router = Router()
  const { get } = actions(router)

  const { dashboardController } = controllers
  get('/', dashboardController.index())

  findRoutes(controllers, router)

  return router
}
