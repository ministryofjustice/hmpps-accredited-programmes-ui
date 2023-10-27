import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware/roleBasedAccessMiddleware'
import { referPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const {
    get,
    delete: deleteAction,
    post,
    put,
  } = RouteUtils.actions(router, { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  const {
    additionalInformationController,
    courseParticipationDetailsController,
    courseParticipationsController,
    referralsController,
    peopleController,
    oasysConfirmationController,
    submittedReferralsController,
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

  get(referPaths.additionalInformation.show.pattern, additionalInformationController.show())
  put(referPaths.additionalInformation.update.pattern, additionalInformationController.update())

  get(referPaths.programmeHistory.index.pattern, courseParticipationsController.index())
  put(
    referPaths.programmeHistory.updateReviewedStatus.pattern,
    courseParticipationsController.updateHasReviewedProgrammeHistory(),
  )
  get(referPaths.programmeHistory.new.pattern, courseParticipationsController.new())
  post(referPaths.programmeHistory.create.pattern, courseParticipationsController.create())
  get(referPaths.programmeHistory.editProgramme.pattern, courseParticipationsController.editCourse())
  put(referPaths.programmeHistory.updateProgramme.pattern, courseParticipationsController.updateCourse())
  get(referPaths.programmeHistory.delete.pattern, courseParticipationsController.delete())
  deleteAction(referPaths.programmeHistory.destroy.pattern, courseParticipationsController.destroy())

  get(referPaths.programmeHistory.details.show.pattern, courseParticipationDetailsController.show())
  put(referPaths.programmeHistory.details.update.pattern, courseParticipationDetailsController.update())

  get(referPaths.checkAnswers.pattern, referralsController.checkAnswers())
  get(referPaths.complete.pattern, referralsController.complete())
  post(referPaths.submit.pattern, referralsController.submit())

  get(referPaths.submitted.personalDetails.pattern, submittedReferralsController.personalDetails())
  get(referPaths.submitted.programmeHistory.pattern, submittedReferralsController.programmeHistory())

  return router
}
