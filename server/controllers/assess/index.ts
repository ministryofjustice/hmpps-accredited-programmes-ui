/* istanbul ignore file */

import AssessCaseListController from './caseListController'
import PniController from './pniController'
import UpdateStatusDecisionController from './updateStatusDecisionController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const assessCaseListController = new AssessCaseListController(
    services.courseService,
    services.referralService,
    services.referenceDataService,
  )

  const pniController = new PniController(
    services.courseService,
    services.pniService,
    services.personService,
    services.referralService,
  )

  const updateStatusDecisionController = new UpdateStatusDecisionController(
    services.personService,
    services.referralService,
  )

  return {
    assessCaseListController,
    pniController,
    updateStatusDecisionController,
  }
}

export default controllers
