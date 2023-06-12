import type { Router } from 'express'

import type { Controllers } from '../controllers'
import actions from '../utils/routeUtils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = actions(router)
  const { coursesController, courseOfferingsController } = controllers

  get('/programmes', coursesController.index())
  get('/programmes/:id', coursesController.show())
  get('/programmes/:id/offerings/:courseOfferingId', courseOfferingsController.show())

  return router
}
