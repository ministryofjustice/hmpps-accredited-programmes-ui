import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import ProgrammeClient from '../data/programmeClient'
import ProgrammesController from '../controllers/find/programmesController'
import ProgrammeService from '../services/programmeService'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const programmeClient = new ProgrammeClient('')
  const programmeService = new ProgrammeService(programmeClient)
  const programmesController = new ProgrammesController(programmeService)

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/programmes', programmesController.index())

  return router
}
