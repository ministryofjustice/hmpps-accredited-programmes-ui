/* istanbul ignore file */

import CategoryController from './categoryController'
import ProgrammeHistoryDetailController from './programmeHistoryDetailController'
import ReasonController from './reasonController'
import ReferralsController from './referralsController'
import RisksAndNeedsController from './risksAndNeedsController'
import StatusHistoryController from './statusHistoryController'
import UpdateStatusActionsController from './updateStatusActionsController'
import UpdateStatusSelectionController from './updateStatusSelectionController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const programmeHistoryDetailController = new ProgrammeHistoryDetailController(
    services.courseService,
    services.personService,
    services.referralService,
  )

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

  const updateStatusActionController = new UpdateStatusActionsController()

  const updateStatusSelectionController = new UpdateStatusSelectionController(
    services.personService,
    services.referenceDataService,
    services.referralService,
  )

  return {
    categoryController,
    programmeHistoryDetailController,
    reasonController,
    referralsController,
    risksAndNeedsController,
    statusHistoryController,
    updateStatusActionController,
    updateStatusSelectionController,
  }
}

export default controllers
