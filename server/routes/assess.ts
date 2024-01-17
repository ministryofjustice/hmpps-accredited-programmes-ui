import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = RouteUtils.actions(router, { allowedRoles: [ApplicationRoles.ACP_PROGRAMME_TEAM] })

  const { assessCaseListController, referralsController, risksAndNeedsController } = controllers

  get(assessPaths.caseList.index.pattern, assessCaseListController.indexRedirect())
  get(assessPaths.caseList.show.pattern, assessCaseListController.show())
  post(assessPaths.caseList.filter.pattern, assessCaseListController.filter())

  get(assessPaths.show.additionalInformation.pattern, referralsController.additionalInformation())
  get(assessPaths.show.offenceHistory.pattern, referralsController.offenceHistory())
  get(assessPaths.show.personalDetails.pattern, referralsController.personalDetails())
  get(assessPaths.show.programmeHistory.pattern, referralsController.programmeHistory())
  get(assessPaths.show.sentenceInformation.pattern, referralsController.sentenceInformation())

  get(assessPaths.show.risksAndNeeds.lifestyleAndAssociates.pattern, risksAndNeedsController.lifestyleAndAssociates())
  get(assessPaths.show.risksAndNeeds.offenceAnalysis.pattern, risksAndNeedsController.offenceAnalysis())
  get(assessPaths.show.risksAndNeeds.roshAnalysis.pattern, risksAndNeedsController.roshAnalysis())

  return router
}
