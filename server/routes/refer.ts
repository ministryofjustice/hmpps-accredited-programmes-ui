import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { referPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post, put } = RouteUtils.actions(router)
  const { referralsController, peopleController } = controllers

  get(referPaths.start.pattern, referralsController.start())
  get(referPaths.new.pattern, referralsController.new())

  post(referPaths.people.find.pattern, peopleController.find())
  get(referPaths.people.show.pattern, peopleController.show())

  post(referPaths.create.pattern, referralsController.create())
  get(referPaths.show.pattern, referralsController.show())
  put(referPaths.update.pattern, referralsController.update())
  get(referPaths.showPerson.pattern, referralsController.showPerson())
  get(referPaths.confirmOasys.pattern, referralsController.confirmOasys())
  get(referPaths.reason.pattern, referralsController.reason())
  get(referPaths.checkAnswers.pattern, referralsController.checkAnswers())
  get(referPaths.complete.pattern, referralsController.complete())
  post(referPaths.submit.pattern, referralsController.submit())

  return router
}
