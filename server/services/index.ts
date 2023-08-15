import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import PersonService from './personService'
import UserService from './userService'
import { courseClientBuilder, hmppsAuthClientBuilder, prisonClientBuilder, prisonerClientBuilder } from '../data'

const services = () => {
  const userService = new UserService(hmppsAuthClientBuilder)
  const courseService = new CourseService(courseClientBuilder)
  const organisationService = new OrganisationService(prisonClientBuilder)
  const personService = new PersonService(prisonerClientBuilder)

  return {
    userService,
    courseService,
    organisationService,
    personService,
  }
}

type Services = ReturnType<typeof services>

export { CourseService, OrganisationService, PersonService, UserService, healthCheck, services }

export type { Services }
