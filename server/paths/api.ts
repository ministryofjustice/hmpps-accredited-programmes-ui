import { path } from 'static-path'

const coursesPath = path('/courses')
const coursePath = coursesPath.path(':courseId')
const courseOfferingsPath = coursePath.path('offerings')

const courseOfferingPath = path('/offerings/:courseOfferingId')
const courseByOfferingPath = courseOfferingPath.path('course')

const referralsPath = path('/referrals')
const referralPath = referralsPath.path(':referralId')
const updateStatusPath = referralPath.path('status')

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
    show: referralPath,
    update: referralPath,
    updateStatus: updateStatusPath,
  },
}
