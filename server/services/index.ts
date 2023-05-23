import CourseService from './courseService'
import OrganisationService from './organisationService'
import UserService from './userService'
import { dataAccess } from '../data'

const services = () => {
  const { hmppsAuthClient, courseClientBuilder, prisonClientBuilder } = dataAccess()

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

export { CourseService, OrganisationService, UserService, services }

export type { Services }
