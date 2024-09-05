/* istanbul ignore file */

import AddCourseController from './addCourseController'
import AddCourseOfferingController from './addCourseOfferingController'
import CourseOfferingsController from './courseOfferingsController'
import CoursesController from './coursesController'
import UpdateCourseController from './updateCourseController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const addCourseController = new AddCourseController(services.courseService)
  const addCourseOfferingController = new AddCourseOfferingController(
    services.courseService,
    services.organisationService,
  )
  const coursesController = new CoursesController(services.courseService, services.organisationService)
  const courseOfferingsController = new CourseOfferingsController(services.courseService, services.organisationService)
  const updateCourseController = new UpdateCourseController(services.courseService)

  return {
    addCourseController,
    addCourseOfferingController,
    courseOfferingsController,
    coursesController,
    updateCourseController,
  }
}

export default controllers
