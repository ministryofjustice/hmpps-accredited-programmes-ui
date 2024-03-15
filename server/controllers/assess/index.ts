/* istanbul ignore file */

import AssessCaseListController from './caseListController'
import UpdateStatusDecisionController from './updateStatusDecisionController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const assessCaseListController = new AssessCaseListController(
    services.courseService,
    services.referralService,
    services.referenceDataService,
  )

  const updateStatusDecisionController = new UpdateStatusDecisionController(services.referralService)

  return {
    assessCaseListController,
    updateStatusDecisionController,
  }
}

export default controllers
