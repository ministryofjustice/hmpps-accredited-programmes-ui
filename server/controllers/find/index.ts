/* istanbul ignore file */

import AddCourseController from './addCourseController'
import CourseOfferingsController from './courseOfferingsController'
import CoursesController from './coursesController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const addCourseController = new AddCourseController(services.courseService)
  const coursesController = new CoursesController(services.courseService, services.organisationService)
  const courseOfferingsController = new CourseOfferingsController(services.courseService, services.organisationService)

  return {
    addCourseController,
    courseOfferingsController,
    coursesController,
  }
}

export default controllers
