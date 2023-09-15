import OasysConfirmationController from './oasysConfirmationController'
import PeopleController from './peopleController'
import ReferralsController from './referralsController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const referralsController = new ReferralsController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.referralService,
  )
  const peopleController = new PeopleController(services.personService)
  const oasysConfirmationController = new OasysConfirmationController(services.personService, services.referralService)

  return {
    oasysConfirmationController,
    peopleController,
    referralsController,
  }
}

export default controllers
