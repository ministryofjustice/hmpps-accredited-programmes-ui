import CourseService from './courseService'
import UserService from './userService'
import { dataAccess } from '../data'

const services = () => {
  const { hmppsAuthClient, courseClientBuilder } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const courseService = new CourseService(courseClientBuilder)

  return {
    userService,
    courseService,
  }
}

type Services = ReturnType<typeof services>

export { CourseService, UserService, services }

export type { Services }
