import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { findPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { delete: deleteAction, get, put } = RouteUtils.actions(router)
  const { coursesController, courseOfferingsController, updateCourseController, updateCourseOfferingController } =
    controllers

  get(findPaths.index.pattern, coursesController.index())
  get(findPaths.show.pattern, coursesController.show())
  get(findPaths.offerings.show.pattern, courseOfferingsController.show())
  deleteAction(findPaths.offerings.delete.pattern, courseOfferingsController.delete())

  get(findPaths.course.update.show.pattern, updateCourseController.show())
  put(findPaths.course.update.submit.pattern, updateCourseController.submit())

  get(findPaths.offerings.update.show.pattern, updateCourseOfferingController.show())
  put(findPaths.offerings.update.submit.pattern, updateCourseOfferingController.submit())

  return router
}
