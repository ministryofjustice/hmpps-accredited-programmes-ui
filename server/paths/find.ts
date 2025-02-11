import { path } from 'static-path'

const findPathBase = path('/find')
const coursesPath = findPathBase.path('programmes')
const coursePath = coursesPath.path(':courseId')

const addCoursePath = coursesPath.path('add')
const updateCoursePath = coursePath.path('update')

const buildingChoicesPath = findPathBase.path('building-choices/:courseId')

const addCourseOfferingPath = coursePath.path('offerings/add')
const deleteCourseOfferingPath = coursePath.path('offerings/:courseOfferingId/delete')
const courseOfferingPath = findPathBase.path('offerings/:courseOfferingId')
const updateCourseOfferingPath = courseOfferingPath.path('update')

const pniFindPath = path('/find-programmes')

export default {
  buildingChoices: {
    form: {
      show: buildingChoicesPath,
      submit: buildingChoicesPath,
    },
    show: buildingChoicesPath.path('course'),
  },
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
    update: {
      show: updateCourseOfferingPath,
      submit: updateCourseOfferingPath,
    },
  },
  pniFind: {
    personSearch: pniFindPath,
    recommendedPathway: pniFindPath.path('recommended-pathway'),
    recommendedProgrammes: pniFindPath.path('recommended-programmes'),
  },
  show: coursePath,
}
