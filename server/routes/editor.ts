import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware'
import { findPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = RouteUtils.actions(router, { allowedRoles: [ApplicationRoles.ACP_EDITOR] })
  const { addCourseController, addCourseOfferingController } = controllers

  get(findPaths.course.add.show.pattern, addCourseController.show())
  post(findPaths.course.add.create.pattern, addCourseController.submit())

  get(findPaths.offerings.add.show.pattern, addCourseOfferingController.show())
  post(findPaths.offerings.add.create.pattern, addCourseOfferingController.submit())

  return router
}
