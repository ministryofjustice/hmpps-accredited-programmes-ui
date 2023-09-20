import type { Router } from 'express'

import Role from '../authentication/role'
import config from '../config'
import type { Controllers } from '../controllers'
// import redirectIfDisabledMiddleware from '../middleware/redirectIfDisabledMiddleware'
import { referPaths } from '../paths'
import Routes from '../utils/routeBuilder'

export default function routes(controllers: Controllers): Router {
  const { reasonController, referralsController, peopleController, oasysConfirmationController } = controllers

  if (config.flags.referEnabled) {
    return Routes.forRole(Role.ACP_REFERRER)
      .get(referPaths.start.pattern, referralsController.start())
      .get(referPaths.new.pattern, referralsController.new())
      .post(referPaths.people.find.pattern, peopleController.find())
      .get(referPaths.people.show.pattern, peopleController.show())
      .post(referPaths.create.pattern, referralsController.create())
      .get(referPaths.show.pattern, referralsController.show())
      .get(referPaths.showPerson.pattern, referralsController.showPerson())
      .get(referPaths.confirmOasys.show.pattern, oasysConfirmationController.show())
      .put(referPaths.confirmOasys.update.pattern, oasysConfirmationController.update())
      .get(referPaths.reason.show.pattern, reasonController.show())
      .put(referPaths.reason.update.pattern, reasonController.update())
      .get(referPaths.checkAnswers.pattern, referralsController.checkAnswers())
      .get(referPaths.complete.pattern, referralsController.complete())
      .post(referPaths.submit.pattern, referralsController.submit())
      .build()
  }

  return Routes.forAnyRole().build()
}
