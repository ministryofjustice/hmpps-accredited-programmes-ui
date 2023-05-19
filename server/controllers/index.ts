import DashboardController from './dashboardController'
import CoursesController from './find/coursesController'
import type { Services } from '../services'

export const controllers = (services: Services) => {
  const coursesController = new CoursesController(services.courseService)
  const dashboardController = new DashboardController()

  return {
    coursesController,
    dashboardController,
  }
}

export type Controllers = ReturnType<typeof controllers>
