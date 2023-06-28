import { Router } from 'express'

import registerFindRoutes from './find'
import controllers from '../controllers'
import { routeUtils } from '../utils'

const router = Router()
const { get } = routeUtils.actions(router)

const { dashboardController } = controllers
get('/', dashboardController.index())

registerFindRoutes(router)

get('/debug-sentry', (_req, _res) => {
  throw new Error('My first Sentry error!')
})

export default router
