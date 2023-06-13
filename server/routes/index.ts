import { type RequestHandler, Router } from 'express'

import type { Controllers } from '../controllers'
import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes(controllers: Controllers): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const { dashboardController, coursesController } = controllers

  get('/', dashboardController.index())

  get('/programmes', coursesController.index())
  get('/programmes/:id', coursesController.show())

  get('/debug-sentry', (_req, res) => {
    throw new Error('My first Sentry error!')
  })

  return router
}
