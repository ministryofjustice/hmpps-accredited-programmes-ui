import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { findPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = RouteUtils.actions(router)
  const { buildingChoicesController, coursesController, courseOfferingsController } = controllers

  get(findPaths.index.pattern, coursesController.index())
  get(findPaths.show.pattern, coursesController.show())
  get(findPaths.offerings.show.pattern, courseOfferingsController.show())

  get(findPaths.buildingChoices.form.show.pattern, buildingChoicesController.show())
  post(findPaths.buildingChoices.form.submit.pattern, buildingChoicesController.submit())

  return router
}
