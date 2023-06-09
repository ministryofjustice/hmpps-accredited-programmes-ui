import { path } from 'static-path'

const coursesPath = path('/courses')
const coursePath = coursesPath.path(':id')

const courseOfferingsPath = coursePath.path('offerings')

export default {
  courses: {
    index: coursesPath,
    show: coursePath,
    offerings: {
      index: courseOfferingsPath,
    },
  },
}
