/* istanbul ignore file */

import CourseService from './courseService'
import healthCheck from './healthCheck'
import OasysService from './oasysService'
import OrganisationService from './organisationService'
import PersonService from './personService'
import ReferralService from './referralService'
import UserService from './userService'
import {
  courseClientBuilder,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  oasysClientBuilder,
  prisonApiClientBuilder,
  prisonRegisterApiClientBuilder,
  prisonerSearchClientBuilder,
  referralClientBuilder,
} from '../data'

const services = () => {
  const oasysService = new OasysService(hmppsAuthClientBuilder, oasysClientBuilder)
  const organisationService = new OrganisationService(prisonRegisterApiClientBuilder)
  const personService = new PersonService(hmppsAuthClientBuilder, prisonApiClientBuilder, prisonerSearchClientBuilder)
  const referralService = new ReferralService(hmppsAuthClientBuilder, referralClientBuilder)
  const userService = new UserService(hmppsManageUsersClientBuilder, prisonApiClientBuilder)
  const courseService = new CourseService(courseClientBuilder, hmppsAuthClientBuilder, userService)

  return {
    courseService,
    oasysService,
    organisationService,
    personService,
    referralService,
    userService,
  }
}

type Services = ReturnType<typeof services>

export {
  CourseService,
  OasysService,
  OrganisationService,
  PersonService,
  ReferralService,
  UserService,
  healthCheck,
  services,
}

export type { Services }
