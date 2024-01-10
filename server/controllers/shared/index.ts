/* istanbul ignore file */

import ReferralsController from './referralsController'
import RisksAndNeedsController from './risksAndNeedsController'
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

  return {
    referralsController,
    risksAndNeedsController,
  }
}

export default controllers
