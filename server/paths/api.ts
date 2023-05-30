import { path } from 'static-path'

const coursesPath = path('/courses')
const coursePath = coursesPath.path(':id')

const courseOfferingsPath = coursePath.path('offerings')

export default {
  courses: {
    index: coursesPath,
    offerings: courseOfferingsPath,
    show: coursePath,
  },
}
