import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import PersonService from './personService'
import ReferralService from './referralService'
import type { UserDetails } from './userService'
import UserService from './userService'
import {
  courseClientBuilder,
  hmppsAuthClientBuilder,
  prisonClientBuilder,
  prisonerClientBuilder,
  referralClientBuilder,
} from '../data'

const services = () => {
  const courseService = new CourseService(courseClientBuilder)
  const organisationService = new OrganisationService(prisonClientBuilder)
  const personService = new PersonService(prisonerClientBuilder)
  const referralService = new ReferralService(referralClientBuilder)
  const userService = new UserService(hmppsAuthClientBuilder)

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

export type { Services, UserDetails }
