import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { referPaths } from '../paths'
import { routeUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = routeUtils.actions(router)
  const { referralsController, peopleController } = controllers

  get(referPaths.start.pattern, referralsController.start())
  get(referPaths.new.pattern, referralsController.new())

  post(referPaths.people.find.pattern, peopleController.find())
  get(referPaths.people.show.pattern, peopleController.show())

  return router
}
