import { path } from 'static-path'

const coursesPath = path('/courses')
const coursePath = coursesPath.path(':courseId')

const courseOfferingsPath = coursePath.path('offerings')
const courseOfferingPath = courseOfferingsPath.path(':courseOfferingId')

const courseByOfferingPath = path('/offerings/:courseOfferingId/course')

export default {
  courses: {
    index: coursesPath,
    offerings: {
      course: courseByOfferingPath,
      index: courseOfferingsPath,
      show: courseOfferingPath,
    },
    show: coursePath,
  },
}
