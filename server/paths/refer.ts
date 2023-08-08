import findPaths from './find'

const referralStartPath = findPaths.offerings.show.path('refer')
const peoplePath = referralStartPath.path('people/:prisonNumber')

export default {
  start: referralStartPath,
  people: {
    show: peoplePath,
  },
}
