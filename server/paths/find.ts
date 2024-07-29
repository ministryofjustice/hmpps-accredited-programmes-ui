import { path } from 'static-path'

const findPathBase = path('/find')
const coursesPath = findPathBase.path('/programmes')
const coursePath = coursesPath.path(':courseId')

const addCoursePath = coursesPath.path('/add')

const addCourseOfferingPath = coursePath.path('/offerings/add')
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
    add: {
      create: addCourseOfferingPath,
      show: addCourseOfferingPath,
    },
    show: courseOfferingPath,
  },
  show: coursePath,
}
