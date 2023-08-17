import PeopleController from './peopleController'
import ReferralsController from './referralsController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const referralsController = new ReferralsController(services.courseService, services.organisationService)
  const peopleController = new PeopleController(services.personService)

  return {
    peopleController,
    referralsController,
  }
}

export default controllers
