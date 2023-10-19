import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { findPaths } from '../paths'
import type { Services } from '../services'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, services: Services, router: Router): Router {
  const { get } = RouteUtils.actions(router, services.auditService)
  const { coursesController, courseOfferingsController } = controllers

  get(findPaths.index.pattern, coursesController.index())
  get(findPaths.show.pattern, coursesController.show())
  get(findPaths.offerings.show.pattern, courseOfferingsController.show())

  return router
}
