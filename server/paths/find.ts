import { path } from 'static-path'

const findPathBase = path('/find')
const coursesPath = findPathBase.path('/programmes')
const coursePath = coursesPath.path(':courseId')

const addCoursePath = coursesPath.path('/add')
const updateCoursePath = coursePath.path('/update')

const addCourseOfferingPath = coursePath.path('/offerings/add')
const deleteCourseOfferingPath = coursePath.path('/offerings/:courseOfferingId/delete')
const courseOfferingPath = findPathBase.path('/offerings/:courseOfferingId')

export default {
  course: {
    add: {
      create: addCoursePath,
      show: addCoursePath,
    },
    update: {
      show: updateCoursePath,
      submit: updateCoursePath,
    },
  },
  index: coursesPath,
  offerings: {
    add: {
      create: addCourseOfferingPath,
      show: addCourseOfferingPath,
    },
    delete: deleteCourseOfferingPath,
    show: courseOfferingPath,
  },
  show: coursePath,
}
