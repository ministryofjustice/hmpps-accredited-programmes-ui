import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { referPaths } from '../paths'
import { routeUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get } = routeUtils.actions(router)
  const { referralsController, peopleController } = controllers

  get(referPaths.start.pattern, referralsController.start())
  get(referPaths.new.pattern, referralsController.new())
  get(referPaths.people.show.pattern, peopleController.show())

  return router
}
