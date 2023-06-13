import DashboardController from './dashboardController'
import CourseOfferingsController from './find/courseOfferingsController'
import CoursesController from './find/coursesController'
import type { Services } from '../services'

export const controllers = (services: Services) => {
  const coursesController = new CoursesController(services.courseService, services.organisationService)
  const courseOfferingsController = new CourseOfferingsController(services.courseService, services.organisationService)
  const dashboardController = new DashboardController()

  return {
    coursesController,
    dashboardController,
    courseOfferingsController,
  }
}

export type Controllers = ReturnType<typeof controllers>
