/* istanbul ignore file */

import AddCourseController from './addCourseController'
import AddCourseOfferingController from './addCourseOfferingController'
import CourseOfferingsController from './courseOfferingsController'
import CoursesController from './coursesController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const addCourseController = new AddCourseController(services.courseService)
  const addCourseOfferingController = new AddCourseOfferingController(
    services.courseService,
    services.organisationService,
  )
  const coursesController = new CoursesController(services.courseService, services.organisationService)
  const courseOfferingsController = new CourseOfferingsController(services.courseService, services.organisationService)

  return {
    addCourseController,
    addCourseOfferingController,
    courseOfferingsController,
    coursesController,
  }
}

export default controllers
