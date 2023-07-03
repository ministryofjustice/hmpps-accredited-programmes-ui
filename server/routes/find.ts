import type { Router } from 'express'

import controllers from '../controllers'
import { findPaths } from '../paths'
import { routeUtils } from '../utils'

export default function registerFindRoutes(router: Router): Router {
  const { get } = routeUtils.actions(router)
  const { coursesController, courseOfferingsController } = controllers

  get(findPaths.courses.index.pattern, coursesController.index())
  get(findPaths.courses.show.pattern, coursesController.show())
  get(findPaths.courses.offerings.show.pattern, courseOfferingsController.show())

  return router
}
