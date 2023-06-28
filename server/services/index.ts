import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import UserService from './userService'
import { courseClientBuilder, hmppsAuthClient, prisonClientBuilder } from '../data'

const services = () => {
  const userService = new UserService(hmppsAuthClient)
  const courseService = new CourseService(courseClientBuilder)
  const organisationService = new OrganisationService(prisonClientBuilder)

  return {
    userService,
    courseService,
    organisationService,
  }
}

type Services = ReturnType<typeof services>

export { CourseService, OrganisationService, UserService, healthCheck, services }

export type { Services }
