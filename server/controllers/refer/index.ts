/* istanbul ignore file */

import CourseParticipationsController from './courseParticipationsController'
import OasysConfirmationController from './oasysConfirmationController'
import PeopleController from './peopleController'
import ReasonController from './reasonController'
import ReferralsController from './referralsController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const courseParticipationsController = new CourseParticipationsController(services.courseService)
  const reasonController = new ReasonController(services.personService, services.referralService)
  const referralsController = new ReferralsController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.referralService,
  )
  const peopleController = new PeopleController(services.personService)
  const oasysConfirmationController = new OasysConfirmationController(services.personService, services.referralService)

  return {
    courseParticipationsController,
    oasysConfirmationController,
    peopleController,
    reasonController,
    referralsController,
  }
}

export default controllers
