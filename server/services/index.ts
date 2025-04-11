/* istanbul ignore file */

import CourseService from './courseService'
import healthCheck from './healthCheck'
import OasysService from './oasysService'
import OrganisationService from './organisationService'
import PersonService from './personService'
import ReferenceDataService from './referenceDataService'
import ReferralService from './referralService'
import StatisticsService from './statisticsService'
import UserService from './userService'
import {
  courseClientBuilder,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  oasysClientBuilder,
  personClientBuilder,
  pniClientBuilder,
  prisonApiClientBuilder,
  prisonRegisterApiClientBuilder,
  referenceDataClientBuilder,
  referralClientBuilder,
  statisticsClientBuilder,
} from '../data'
import PniService from './pniService'

const services = () => {
  const oasysService = new OasysService(hmppsAuthClientBuilder, oasysClientBuilder)
  const organisationService = new OrganisationService(prisonRegisterApiClientBuilder)
  const personService = new PersonService(hmppsAuthClientBuilder, prisonApiClientBuilder, personClientBuilder)
  const userService = new UserService(hmppsManageUsersClientBuilder, prisonApiClientBuilder)
  const referenceDataService = new ReferenceDataService(hmppsAuthClientBuilder, referenceDataClientBuilder)
  const courseService = new CourseService(courseClientBuilder, hmppsAuthClientBuilder, userService)
  const pniService = new PniService(hmppsAuthClientBuilder, pniClientBuilder)
  const statisticsService = new StatisticsService(hmppsAuthClientBuilder, statisticsClientBuilder)
  const referralService = new ReferralService(
    hmppsAuthClientBuilder,
    referralClientBuilder,
    userService,
    courseService,
    pniService,
  )

  return {
    courseService,
    oasysService,
    organisationService,
    personService,
    pniService,
    referenceDataService,
    referralService,
    statisticsService,
    userService,
  }
}

type Services = ReturnType<typeof services>

export {
  CourseService,
  OasysService,
  OrganisationService,
  PersonService,
  PniService,
  ReferenceDataService,
  ReferralService,
  StatisticsService,
  UserService,
  healthCheck,
  services,
}

export type { Services }
