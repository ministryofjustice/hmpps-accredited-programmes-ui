/* istanbul ignore file */

import AssessCaseListController from './caseListController'
import PniController from './pniController'
import TransferReferralController from './transferReferralController'
import TransferReferralErrorController from './transferReferralErrorController'
import UpdateLdcController from './updateLdcController'
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

  const transferReferralController = new TransferReferralController(
    services.courseService,
    services.personService,
    services.pniService,
    services.referralService,
  )

  const transferReferralErrorController = new TransferReferralErrorController(
    services.courseService,
    services.organisationService,
    services.personService,
  )

  const updateLdcController = new UpdateLdcController(
    services.courseService,
    services.personService,
    services.referralService,
  )

  return {
    assessCaseListController,
    pniController,
    transferReferralController,
    transferReferralErrorController,
    updateLdcController,
    updateStatusDecisionController,
  }
}

export default controllers
