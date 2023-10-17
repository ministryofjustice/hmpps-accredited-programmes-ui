/* istanbul ignore file */

import CourseParticipationDetailsController from './courseParticipationDetailsController'
import CourseParticipationsController from './courseParticipationsController'
import OasysConfirmationController from './oasysConfirmationController'
import PeopleController from './peopleController'
import ReasonController from './reasonController'
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
  const peopleController = new PeopleController(services.personService)
  const reasonController = new ReasonController(services.personService, services.referralService)
  const oasysConfirmationController = new OasysConfirmationController(services.personService, services.referralService)
  const courseParticipationsController = new CourseParticipationsController(
    services.courseService,
    services.personService,
    services.referralService,
    services.userService,
  )
  const courseParticipationDetailsController = new CourseParticipationDetailsController(
    services.courseService,
    services.personService,
    services.referralService,
  )

  return {
    courseParticipationDetailsController,
    courseParticipationsController,
    oasysConfirmationController,
    peopleController,
    reasonController,
    referralsController,
  }
}

export default controllers
