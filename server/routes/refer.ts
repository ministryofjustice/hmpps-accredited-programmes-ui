import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware/roleBasedAccessMiddleware'
import { referPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post, put } = RouteUtils.actions(router)
  const {
    courseParticipationsController,
    reasonController,
    referralsController,
    peopleController,
    oasysConfirmationController,
  } = controllers

  get(referPaths.start.pattern, referralsController.start(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  get(referPaths.new.pattern, referralsController.new(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })

  post(referPaths.people.find.pattern, peopleController.find(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  get(referPaths.people.show.pattern, peopleController.show(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })

  post(referPaths.create.pattern, referralsController.create(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  get(referPaths.show.pattern, referralsController.show(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  get(referPaths.showPerson.pattern, referralsController.showPerson(), {
    allowedRoles: [ApplicationRoles.ACP_REFERRER],
  })

  get(referPaths.confirmOasys.show.pattern, oasysConfirmationController.show(), {
    allowedRoles: [ApplicationRoles.ACP_REFERRER],
  })
  put(referPaths.confirmOasys.update.pattern, oasysConfirmationController.update(), {
    allowedRoles: [ApplicationRoles.ACP_REFERRER],
  })

  get(referPaths.reason.show.pattern, reasonController.show(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  put(referPaths.reason.update.pattern, reasonController.update(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })

  get(referPaths.programmeHistory.new.pattern, courseParticipationsController.new(), {
    allowedRoles: [ApplicationRoles.ACP_REFERRER],
  })
  get(referPaths.programmeHistory.index.pattern, courseParticipationsController.index(), {
    allowedRoles: [ApplicationRoles.ACP_REFERRER],
  })

  get(referPaths.checkAnswers.pattern, referralsController.checkAnswers(), {
    allowedRoles: [ApplicationRoles.ACP_REFERRER],
  })
  get(referPaths.complete.pattern, referralsController.complete(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  post(referPaths.submit.pattern, referralsController.submit(), { allowedRoles: [ApplicationRoles.ACP_REFERRER] })

  return router
}
