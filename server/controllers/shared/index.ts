/* istanbul ignore file */

import ReferralsController from './referralsController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const referralsController = new ReferralsController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.referralService,
    services.userService,
  )

  return {
    referralsController,
  }
}

export default controllers
