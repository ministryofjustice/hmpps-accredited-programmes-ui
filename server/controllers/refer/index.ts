/* istanbul ignore file */

import type { Services } from '../../services'
import ReferCaseListController from './caseListController'
import referNewControllers from './new'

const controllers = (services: Services) => {
  const referCaseListController = new ReferCaseListController(services.referralService)

  return {
    ...referNewControllers(services),
    referCaseListController,
  }
}

export default controllers
