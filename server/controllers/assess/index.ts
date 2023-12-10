/* istanbul ignore file */

import AssessCaseListController from './caseListController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const assessCaseListController = new AssessCaseListController(services.courseService, services.referralService)

  return {
    assessCaseListController,
  }
}

export default controllers
