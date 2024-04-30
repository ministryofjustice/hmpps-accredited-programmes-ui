import { path } from 'static-path'

const findPathBase = path('/find')
const coursesPath = findPathBase.path('/programmes')
const coursePath = coursesPath.path(':courseId')

const courseOfferingPath = findPathBase.path('/offerings/:courseOfferingId')

export default {
  index: coursesPath,
  offerings: {
    show: courseOfferingPath,
  },
  show: coursePath,
}
