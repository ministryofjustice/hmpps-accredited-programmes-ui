/* istanbul ignore file */

import ReferCaseListController from './caseListController'
import referNewControllers from './new'
import UpdateStatusActionsController from './updateStatusActionsController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const referCaseListController = new ReferCaseListController(services.referralService)

  const updateStatusActionController = new UpdateStatusActionsController()

  return {
    ...referNewControllers(services),
    referCaseListController,
    updateStatusActionController,
  }
}

export default controllers
