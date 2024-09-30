import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { reportsPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = RouteUtils.actions(router)
  const { reportsController } = controllers

  get(reportsPaths.show.pattern, reportsController.show())

  return router
}
