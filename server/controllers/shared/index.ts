/* istanbul ignore file */

import SubmittedReferralsController from './submittedReferralsController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const submittedReferralsController = new SubmittedReferralsController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.referralService,
    services.sentenceInformationService,
  )

  return {
    submittedReferralsController,
  }
}

export default controllers
