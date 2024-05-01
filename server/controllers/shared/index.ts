/* istanbul ignore file */

import CategoryController from './categoryController'
import ReasonController from './reasonController'
import ReferralsController from './referralsController'
import RisksAndNeedsController from './risksAndNeedsController'
import StatusHistoryController from './statusHistoryController'
import UpdateStatusSelectionController from './updateStatusSelectionController'
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

  const categoryController = new CategoryController(
    services.personService,
    services.referenceDataService,
    services.referralService,
  )

  const reasonController = new ReasonController(
    services.personService,
    services.referenceDataService,
    services.referralService,
  )

  const updateStatusSelectionController = new UpdateStatusSelectionController(
    services.personService,
    services.referralService,
  )

  return {
    categoryController,
    reasonController,
    referralsController,
    risksAndNeedsController,
    statusHistoryController,
    updateStatusSelectionController,
  }
}

export default controllers
