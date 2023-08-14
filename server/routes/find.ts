import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { findPaths } from '../paths'
import { routeUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = routeUtils.actions(router)
  const { coursesController, courseOfferingsController } = controllers

  get(findPaths.index.pattern, coursesController.index())
  get(findPaths.show.pattern, coursesController.show())
  get(findPaths.offerings.show.pattern, courseOfferingsController.show())

  return router
}
