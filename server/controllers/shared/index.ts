/* istanbul ignore file */

import CategoryController from './categoryController'
import ReferralsController from './referralsController'
import RisksAndNeedsController from './risksAndNeedsController'
import StatusHistoryController from './statusHistoryController'
import UpdateStatusSelectionController from './updateStatusSelectionController'
import WithdrawCategoryController from './withdrawCategoryController'
import WithdrawReasonController from './withdrawReasonController'
import WithdrawReasonInformationController from './withdrawReasonInformationController'
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

  const updateStatusSelectionController = new UpdateStatusSelectionController(
    services.referenceDataService,
    services.referralService,
  )

  const withdrawCategoryController = new WithdrawCategoryController(
    services.referenceDataService,
    services.referralService,
  )

  const categoryController = new CategoryController(services.referenceDataService, services.referralService)

  const withdrawReasonController = new WithdrawReasonController(services.referenceDataService, services.referralService)

  const withdrawReasonInformationController = new WithdrawReasonInformationController(services.referralService)

  return {
    categoryController,
    referralsController,
    risksAndNeedsController,
    statusHistoryController,
    updateStatusSelectionController,
    withdrawCategoryController,
    withdrawReasonController,
    withdrawReasonInformationController,
  }
}

export default controllers
