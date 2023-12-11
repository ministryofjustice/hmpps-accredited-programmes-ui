/* istanbul ignore file */

import ReferCaseListController from './caseListController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const referCaseListController = new ReferCaseListController(services.referralService)

  return {
    referCaseListController,
  }
}

export default controllers
