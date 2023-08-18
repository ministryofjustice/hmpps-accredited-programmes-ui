import { path } from 'static-path'

const coursesPath = path('/courses')
const coursePath = coursesPath.path(':courseId')

const courseOfferingsPath = coursePath.path('offerings')
const courseOfferingPath = courseOfferingsPath.path(':courseOfferingId')

export default {
  courses: {
    index: coursesPath,
    offerings: {
      index: courseOfferingsPath,
      show: courseOfferingPath,
    },
    show: coursePath,
  },
}
