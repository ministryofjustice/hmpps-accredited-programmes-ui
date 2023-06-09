import { path } from 'static-path'

const coursesPath = path('/programmes')
const coursePath = coursesPath.path(':courseId')

const courseOfferingPath = coursePath.path('offerings/:courseOfferingId')

export default {
  courses: {
    index: coursesPath,
    show: coursePath,
    offerings: {
      show: courseOfferingPath,
    },
  },
}
