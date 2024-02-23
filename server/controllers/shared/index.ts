/* istanbul ignore file */

import ReferralsController from './referralsController'
import RisksAndNeedsController from './risksAndNeedsController'
import StatusHistoryController from './statusHistoryController'
import WithdrawCategoryController from './withdrawCategoryController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const referralsController = new ReferralsController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.referralService,
    services.userService,
  )
  const risksAndNeedsController = new RisksAndNeedsController(
    services.courseService,
    services.oasysService,
    services.personService,
    services.referralService,
  )

  const statusHistoryController = new StatusHistoryController(
    services.courseService,
    services.personService,
    services.referralService,
  )

  const withdrawCategoryController = new WithdrawCategoryController(
    services.referenceDataService,
    services.referralService,
  )

  return {
    referralsController,
    risksAndNeedsController,
    statusHistoryController,
    withdrawCategoryController,
  }
}

export default controllers
