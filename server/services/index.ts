import CourseService from './courseService'
import UserService from './userService'
import { dataAccess } from '../data'

export const services = () => {
  const { hmppsAuthClient, courseClientBuilder } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const courseService = new CourseService(courseClientBuilder)

  return {
    userService,
    courseService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, CourseService }
