import CourseOfferingsController from './courseOfferingsController'
import CoursesController from './coursesController'

const coursesController = new CoursesController()
const courseOfferingsController = new CourseOfferingsController()

export default {
  coursesController,
  courseOfferingsController,
}
