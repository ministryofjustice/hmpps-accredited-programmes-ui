/* istanbul ignore file */

import CaseListController from './caseListController'
import ReferralsController from './referralsController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const caseListController = new CaseListController(services.courseService, services.referralService)
  const referralsController = new ReferralsController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.referralService,
  )

  return {
    caseListController,
    referralsController,
  }
}

export default controllers
