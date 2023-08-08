import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import UserService from './userService'
import { courseClientBuilder, hmppsAuthClientBuilder, prisonClientBuilder } from '../data'

const services = () => {
  const userService = new UserService(hmppsAuthClientBuilder)
  const courseService = new CourseService(courseClientBuilder)
  const organisationService = new OrganisationService(prisonClientBuilder)

  return {
    userService,
    courseService,
    organisationService,
  }
}

type Services = ReturnType<typeof services>

export { CourseService, OrganisationService, PersonService, UserService, healthCheck, services }

export type { Services }
