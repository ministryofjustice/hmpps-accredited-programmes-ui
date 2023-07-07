import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import UserService from './userService'
import { courseClientBuilder, hmppsAuthClient, prisonClientBuilder } from '../data'

const services = {
  userService: new UserService(hmppsAuthClient),
  courseService: new CourseService(courseClientBuilder),
  organisationService: new OrganisationService(prisonClientBuilder),
}

type Services = typeof services

export { CourseService, OrganisationService, UserService, healthCheck, services }

export type { Services }
