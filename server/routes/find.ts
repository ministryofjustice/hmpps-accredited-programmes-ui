import type { Router } from 'express'

import type { Controllers } from '../controllers'
import findPaths from '../paths/find'
import actions from '../utils/routeUtils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = actions(router)
  const { coursesController, courseOfferingsController } = controllers

  get(findPaths.courses.index.pattern, coursesController.index())
  get(findPaths.courses.show.pattern, coursesController.show())
  get(findPaths.courses.offerings.show.pattern, courseOfferingsController.show())

  return router
}
