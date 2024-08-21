/* istanbul ignore file */

import CourseService from './courseService'
import healthCheck from './healthCheck'
import OasysService from './oasysService'
import OrganisationService from './organisationService'
import PersonService from './personService'
import ReferenceDataService from './referenceDataService'
import ReferralService from './referralService'
import UserService from './userService'
import {
  courseClientBuilder,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  oasysClientBuilder,
  personClientBuilder,
  prisonApiClientBuilder,
  prisonRegisterApiClientBuilder,
  referenceDataClientBuilder,
  referralClientBuilder,
} from '../data'

const services = () => {
  const oasysService = new OasysService(hmppsAuthClientBuilder, oasysClientBuilder)
  const organisationService = new OrganisationService(prisonRegisterApiClientBuilder)
  const personService = new PersonService(hmppsAuthClientBuilder, prisonApiClientBuilder, personClientBuilder)
  const userService = new UserService(hmppsManageUsersClientBuilder, prisonApiClientBuilder)
  const referenceDataService = new ReferenceDataService(hmppsAuthClientBuilder, referenceDataClientBuilder)
  const referralService = new ReferralService(hmppsAuthClientBuilder, referralClientBuilder, userService)
  const courseService = new CourseService(courseClientBuilder, hmppsAuthClientBuilder, userService)

  return {
    courseService,
    oasysService,
    organisationService,
    personService,
    referenceDataService,
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
  ReferenceDataService,
  ReferralService,
  UserService,
  healthCheck,
  services,
}

export type { Services }
