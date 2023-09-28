import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware/roleBasedAccessMiddleware'
import { referPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post, put } = RouteUtils.actions(router, { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  const {
    courseParticipationsController,
    reasonController,
    referralsController,
    peopleController,
    oasysConfirmationController,
  } = controllers

  get(referPaths.start.pattern, referralsController.start())
  get(referPaths.new.pattern, referralsController.new())

  post(referPaths.people.find.pattern, peopleController.find())
  get(referPaths.people.show.pattern, peopleController.show())

  post(referPaths.create.pattern, referralsController.create())
  get(referPaths.show.pattern, referralsController.show())
  get(referPaths.showPerson.pattern, referralsController.showPerson())

  get(referPaths.confirmOasys.show.pattern, oasysConfirmationController.show())
  put(referPaths.confirmOasys.update.pattern, oasysConfirmationController.update())

  get(referPaths.reason.show.pattern, reasonController.show())
  put(referPaths.reason.update.pattern, reasonController.update())

  get(referPaths.programmeHistory.index.pattern, courseParticipationsController.index())
  get(referPaths.programmeHistory.new.pattern, courseParticipationsController.new())
  post(referPaths.programmeHistory.create.pattern, courseParticipationsController.create())

  get(referPaths.checkAnswers.pattern, referralsController.checkAnswers())
  get(referPaths.complete.pattern, referralsController.complete())
  post(referPaths.submit.pattern, referralsController.submit())

  return router
}
