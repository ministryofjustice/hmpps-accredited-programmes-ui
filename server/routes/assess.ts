import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = RouteUtils.actions(router, { allowedRoles: [ApplicationRoles.ACP_PROGRAMME_TEAM] })

  const {
    assessCaseListController,
    categoryController,
    reasonController,
    referralsController,
    risksAndNeedsController,
    statusHistoryController,
    updateStatusDecisionController,
    updateStatusSelectionController,
  } = controllers

  get(assessPaths.caseList.index.pattern, assessCaseListController.indexRedirect())
  get(assessPaths.caseList.show.pattern, assessCaseListController.show())
  post(assessPaths.caseList.filter.pattern, assessCaseListController.filter())

  get(assessPaths.show.statusHistory.pattern, statusHistoryController.show())

  get(assessPaths.show.additionalInformation.pattern, referralsController.additionalInformation())
  get(assessPaths.show.offenceHistory.pattern, referralsController.offenceHistory())
  get(assessPaths.show.personalDetails.pattern, referralsController.personalDetails())
  get(assessPaths.show.programmeHistory.pattern, referralsController.programmeHistory())
  get(assessPaths.show.releaseDates.pattern, referralsController.releaseDates())
  get(assessPaths.show.sentenceInformation.pattern, referralsController.sentenceInformation())

  get(assessPaths.show.risksAndNeeds.attitudes.pattern, risksAndNeedsController.attitudes())
  get(assessPaths.show.risksAndNeeds.drugMisuse.pattern, risksAndNeedsController.drugMisuse())
  get(assessPaths.show.risksAndNeeds.emotionalWellbeing.pattern, risksAndNeedsController.emotionalWellbeing())
  get(assessPaths.show.risksAndNeeds.health.pattern, risksAndNeedsController.health())
  get(assessPaths.show.risksAndNeeds.learningNeeds.pattern, risksAndNeedsController.learningNeeds())
  get(assessPaths.show.risksAndNeeds.lifestyleAndAssociates.pattern, risksAndNeedsController.lifestyleAndAssociates())
  get(assessPaths.show.risksAndNeeds.offenceAnalysis.pattern, risksAndNeedsController.offenceAnalysis())
  get(assessPaths.show.risksAndNeeds.relationships.pattern, risksAndNeedsController.relationships())
  get(assessPaths.show.risksAndNeeds.risksAndAlerts.pattern, risksAndNeedsController.risksAndAlerts())
  get(assessPaths.show.risksAndNeeds.roshAnalysis.pattern, risksAndNeedsController.roshAnalysis())
  get(assessPaths.show.risksAndNeeds.thinkingAndBehaving.pattern, risksAndNeedsController.thinkingAndBehaving())

  get(assessPaths.updateStatus.decision.show.pattern, updateStatusDecisionController.show())
  post(assessPaths.updateStatus.decision.submit.pattern, updateStatusDecisionController.submit())

  get(assessPaths.updateStatus.category.show.pattern, categoryController.show())
  post(assessPaths.updateStatus.category.submit.pattern, categoryController.submit())

  get(assessPaths.updateStatus.reason.show.pattern, reasonController.show())
  post(assessPaths.updateStatus.reason.submit.pattern, reasonController.submit())

  get(assessPaths.updateStatus.selection.show.pattern, updateStatusSelectionController.show())
  post(
    assessPaths.updateStatus.selection.confirmation.submit.pattern,
    updateStatusSelectionController.submitConfirmation(),
  )
  post(assessPaths.updateStatus.selection.reason.submit.pattern, updateStatusSelectionController.submitReason())

  return router
}
