/* istanbul ignore file */

import AssessCaseListController from './caseListController'
import DuplicateTransferReferralController from './duplicateTransferReferralController'
import PniController from './pniController'
import TransferBuildingChoicesController from './transferReferralController'
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

  const transferBuildingChoicesController = new TransferBuildingChoicesController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.pniService,
    services.referralService,
  )

  const duplicateTransferReferralController = new DuplicateTransferReferralController(
    services.courseService,
    services.referralService,
  )

  return {
    assessCaseListController,
    duplicateTransferReferralController,
    pniController,
    transferBuildingChoicesController,
    updateStatusDecisionController,
  }
}

export default controllers
