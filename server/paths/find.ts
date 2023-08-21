import { path } from 'static-path'

const coursesPath = path('/programmes')
const coursePath = coursesPath.path(':courseId')

const courseOfferingPath = path('/offerings/:courseOfferingId')

export default {
  index: coursesPath,
  offerings: {
    show: courseOfferingPath,
  },
  show: coursePath,
}
