/* istanbul ignore file */

import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import PersonService from './personService'
import ReferralService from './referralService'
import UserService from './userService'
import {
  caseloadClientBuilder,
  courseClientBuilder,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  prisonApiClientBuilder,
  prisonRegisterApiClientBuilder,
  prisonerClientBuilder,
  referralClientBuilder,
} from '../data'

const services = () => {
  const organisationService = new OrganisationService(prisonRegisterApiClientBuilder)
  const personService = new PersonService(hmppsAuthClientBuilder, prisonApiClientBuilder, prisonerClientBuilder)
  const referralService = new ReferralService(referralClientBuilder)
  const userService = new UserService(hmppsManageUsersClientBuilder, caseloadClientBuilder)
  const courseService = new CourseService(courseClientBuilder, userService)

  return {
    courseService,
    organisationService,
    personService,
    referralService,
    userService,
  }
}

type Services = ReturnType<typeof services>

export { CourseService, OrganisationService, PersonService, ReferralService, UserService, healthCheck, services }

export type { Services }
