/* istanbul ignore file */

import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import PersonService from './personService'
import ReferralService from './referralService'
import SentenceInformationService from './sentenceInformationService'
import UserService from './userService'
import {
  caseloadClientBuilder,
  courseClientBuilder,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  prisonClientBuilder,
  prisonerClientBuilder,
  referralClientBuilder,
  sentenceInformationClientBuilder,
} from '../data'

const services = () => {
  const organisationService = new OrganisationService(prisonClientBuilder)
  const personService = new PersonService(hmppsAuthClientBuilder, prisonerClientBuilder)
  const referralService = new ReferralService(referralClientBuilder)
  const sentenceInformationService = new SentenceInformationService(sentenceInformationClientBuilder)
  const userService = new UserService(hmppsManageUsersClientBuilder, caseloadClientBuilder)
  const courseService = new CourseService(courseClientBuilder, userService)

  return {
    courseService,
    organisationService,
    personService,
    referralService,
    sentenceInformationService,
    userService,
  }
}

type Services = ReturnType<typeof services>

export {
  CourseService,
  OrganisationService,
  PersonService,
  ReferralService,
  SentenceInformationService,
  UserService,
  healthCheck,
  services,
}

export type { Services }
