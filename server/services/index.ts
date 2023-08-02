import CourseService from './courseService'
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

export { CourseService, OrganisationService, UserService, services }

export type { Services }
