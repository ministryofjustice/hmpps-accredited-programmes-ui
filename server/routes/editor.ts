import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware'
import { findPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const {
    delete: deleteAction,
    get,
    post,
    put,
  } = RouteUtils.actions(router, { allowedRoles: [ApplicationRoles.ACP_EDITOR] })
  const {
    addCourseController,
    addCourseOfferingController,
    courseOfferingsController,
    updateCourseController,
    updateCourseOfferingController,
  } = controllers

  get(findPaths.course.add.show.pattern, addCourseController.show())
  post(findPaths.course.add.create.pattern, addCourseController.submit())

  get(findPaths.course.update.show.pattern, updateCourseController.show())
  put(findPaths.course.update.submit.pattern, updateCourseController.submit())

  get(findPaths.offerings.add.show.pattern, addCourseOfferingController.show())
  post(findPaths.offerings.add.create.pattern, addCourseOfferingController.submit())

  get(findPaths.offerings.update.show.pattern, updateCourseOfferingController.show())
  put(findPaths.offerings.update.submit.pattern, updateCourseOfferingController.submit())
  deleteAction(findPaths.offerings.delete.pattern, courseOfferingsController.delete())

  return router
}
