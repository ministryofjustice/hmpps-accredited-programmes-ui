import { path } from 'static-path'

const coursesPath = path('/courses')
const coursePath = coursesPath.path(':courseId')

const courseOfferingsPath = coursePath.path('offerings')
const courseOfferingPath = courseOfferingsPath.path(':courseOfferingId')

const courseByOfferingPath = path('/offerings/:courseOfferingId/course')

const referralsPath = path('/referrals')

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
  referrals: {
    create: referralsPath,
  },
}
