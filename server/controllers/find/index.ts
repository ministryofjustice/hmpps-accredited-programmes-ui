import CourseOfferingsController from './courseOfferingsController'
import CoursesController from './coursesController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const coursesController = new CoursesController(services.courseService, services.organisationService)
  const courseOfferingsController = new CourseOfferingsController(services.courseService, services.organisationService)

  return {
    coursesController,
    courseOfferingsController,
  }
}

export default controllers
