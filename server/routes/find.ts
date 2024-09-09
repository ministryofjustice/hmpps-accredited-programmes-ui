import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { findPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { delete: deleteAction, get } = RouteUtils.actions(router)
  const { coursesController, courseOfferingsController } = controllers

  get(findPaths.index.pattern, coursesController.index())
  get(findPaths.show.pattern, coursesController.show())
  get(findPaths.offerings.show.pattern, courseOfferingsController.show())
  deleteAction(findPaths.offerings.delete.pattern, courseOfferingsController.delete())

  return router
}
