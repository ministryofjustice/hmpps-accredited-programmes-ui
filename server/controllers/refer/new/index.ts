/* istanbul ignore file */

import NewReferralsAdditionalInformationController from './additionalInformationController'
import NewReferralsCourseParticipationDetailsController from './courseParticipationDetailsController'
import NewReferralsCourseParticipationsController from './courseParticipationsController'
import NewReferralsOasysConfirmationController from './oasysConfirmationController'
import NewReferralsPeopleController from './peopleController'
import NewReferralsController from './referralsController'
import type { Services } from '../../../services'

const controllers = (services: Services) => {
  const newReferralsController = new NewReferralsController(
    services.courseService,
    services.organisationService,
    services.personService,
    services.referralService,
  )
  const newReferralsPeopleController = new NewReferralsPeopleController(services.personService)
  const newReferralsAdditionalInformationController = new NewReferralsAdditionalInformationController(
    services.personService,
    services.referralService,
  )
  const newReferralsOasysConfirmationController = new NewReferralsOasysConfirmationController(
    services.personService,
    services.referralService,
  )
  const newReferralsCourseParticipationsController = new NewReferralsCourseParticipationsController(
    services.courseService,
    services.personService,
    services.referralService,
  )
  const newReferralsCourseParticipationDetailsController = new NewReferralsCourseParticipationDetailsController(
    services.courseService,
    services.personService,
    services.referralService,
  )

  return {
    newReferralsAdditionalInformationController,
    newReferralsController,
    newReferralsCourseParticipationDetailsController,
    newReferralsCourseParticipationsController,
    newReferralsOasysConfirmationController,
    newReferralsPeopleController,
  }
}

export default controllers
