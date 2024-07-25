import { path } from 'static-path'

const findPathBase = path('/find')
const coursesPath = findPathBase.path('/programmes')
const coursePath = coursesPath.path(':courseId')

const addCoursePath = coursesPath.path('/add')

const courseOfferingPath = findPathBase.path('/offerings/:courseOfferingId')

export default {
  course: {
    add: {
      create: addCoursePath,
      show: addCoursePath,
    },
  },
  index: coursesPath,
  offerings: {
    show: courseOfferingPath,
  },
  show: coursePath,
}
