import { type RequestHandler, Router } from 'express'

import { Controllers } from '../controllers'
import asyncMiddleware from '../middleware/asyncMiddleware'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(controllers: Controllers): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const { dashboardController, programmesController } = controllers

  get('/', dashboardController.index())

  get('/programmes', programmesController.index())

  return router
}
