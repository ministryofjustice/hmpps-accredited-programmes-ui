/* istanbul ignore file */

import ReferCaseListController from './caseListController'
import referNewControllers from './new'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const referCaseListController = new ReferCaseListController(services.referralService)

  return {
    ...referNewControllers(services),
    referCaseListController,
  }
}

export default controllers
