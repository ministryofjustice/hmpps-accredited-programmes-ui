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
    categoryController,
    referCaseListController,
    newReferralsAdditionalInformationController,
    newReferralsCourseParticipationDetailsController,
    newReferralsCourseParticipationsController,
    newReferralsController,
    newReferralsPeopleController,
    newReferralsOasysConfirmationController,
    reasonController,
    referralsController,
    risksAndNeedsController,
    statusHistoryController,
    updateStatusActionController,
    updateStatusSelectionController,
  } = controllers

  get(referPaths.caseList.index.pattern, referCaseListController.indexRedirect())
  get(referPaths.caseList.show.pattern, referCaseListController.show())

  get(referPaths.new.start.pattern, newReferralsController.start())
  get(referPaths.new.new.pattern, newReferralsController.new())

  post(referPaths.new.people.find.pattern, newReferralsPeopleController.find())
  get(referPaths.new.people.show.pattern, newReferralsPeopleController.show())

  post(referPaths.new.create.pattern, newReferralsController.create())
  get(referPaths.new.show.pattern, newReferralsController.show())
  get(referPaths.new.showPerson.pattern, newReferralsController.showPerson())

  get(referPaths.new.confirmOasys.show.pattern, newReferralsOasysConfirmationController.show())
  put(referPaths.new.confirmOasys.update.pattern, newReferralsOasysConfirmationController.update())

  get(referPaths.new.additionalInformation.show.pattern, newReferralsAdditionalInformationController.show())
  put(referPaths.new.additionalInformation.update.pattern, newReferralsAdditionalInformationController.update())

  get(referPaths.new.programmeHistory.index.pattern, newReferralsCourseParticipationsController.index())
  put(
    referPaths.new.programmeHistory.updateReviewedStatus.pattern,
    newReferralsCourseParticipationsController.updateHasReviewedProgrammeHistory(),
  )
  get(referPaths.new.programmeHistory.new.pattern, newReferralsCourseParticipationsController.new())
  post(referPaths.new.programmeHistory.create.pattern, newReferralsCourseParticipationsController.create())
  get(referPaths.new.programmeHistory.editProgramme.pattern, newReferralsCourseParticipationsController.editCourse())
  put(
    referPaths.new.programmeHistory.updateProgramme.pattern,
    newReferralsCourseParticipationsController.updateCourse(),
  )
  get(referPaths.new.programmeHistory.delete.pattern, newReferralsCourseParticipationsController.delete())
  deleteAction(referPaths.new.programmeHistory.destroy.pattern, newReferralsCourseParticipationsController.destroy())

  get(referPaths.new.programmeHistory.details.show.pattern, newReferralsCourseParticipationDetailsController.show())
  put(referPaths.new.programmeHistory.details.update.pattern, newReferralsCourseParticipationDetailsController.update())

  get(referPaths.new.checkAnswers.pattern, newReferralsController.checkAnswers())
  get(referPaths.new.complete.pattern, newReferralsController.complete())
  post(referPaths.new.submit.pattern, newReferralsController.submit())

  get(referPaths.show.statusHistory.pattern, statusHistoryController.show())

  get(referPaths.show.additionalInformation.pattern, referralsController.additionalInformation())
  get(referPaths.show.offenceHistory.pattern, referralsController.offenceHistory())
  get(referPaths.show.personalDetails.pattern, referralsController.personalDetails())
  get(referPaths.show.programmeHistory.pattern, referralsController.programmeHistory())
  get(referPaths.show.sentenceInformation.pattern, referralsController.sentenceInformation())

  get(referPaths.show.risksAndNeeds.attitudes.pattern, risksAndNeedsController.attitudes())
  get(referPaths.show.risksAndNeeds.emotionalWellbeing.pattern, risksAndNeedsController.emotionalWellbeing())
  get(referPaths.show.risksAndNeeds.health.pattern, risksAndNeedsController.health())
  get(referPaths.show.risksAndNeeds.learningNeeds.pattern, risksAndNeedsController.learningNeeds())
  get(referPaths.show.risksAndNeeds.lifestyleAndAssociates.pattern, risksAndNeedsController.lifestyleAndAssociates())
  get(referPaths.show.risksAndNeeds.offenceAnalysis.pattern, risksAndNeedsController.offenceAnalysis())
  get(referPaths.show.risksAndNeeds.relationships.pattern, risksAndNeedsController.relationships())
  get(referPaths.show.risksAndNeeds.risksAndAlerts.pattern, risksAndNeedsController.risksAndAlerts())
  get(referPaths.show.risksAndNeeds.roshAnalysis.pattern, risksAndNeedsController.roshAnalysis())
  get(referPaths.show.risksAndNeeds.thinkingAndBehaving.pattern, risksAndNeedsController.thinkingAndBehaving())

  get(referPaths.updateStatus.category.show.pattern, categoryController.show())
  post(referPaths.updateStatus.category.submit.pattern, categoryController.submit())

  get(referPaths.updateStatus.reason.show.pattern, reasonController.show())
  post(referPaths.updateStatus.reason.submit.pattern, reasonController.submit())

  get(referPaths.updateStatus.selection.show.pattern, updateStatusSelectionController.show())
  post(
    referPaths.updateStatus.selection.confirmation.submit.pattern,
    updateStatusSelectionController.submitConfirmation(),
  )
  post(referPaths.updateStatus.selection.reason.submit.pattern, updateStatusSelectionController.submitReason())

  get(referPaths.manageHold.pattern, updateStatusActionController.manageHold())
  get(referPaths.withdraw.pattern, updateStatusActionController.withdraw())

  return router
}
