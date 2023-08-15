import findPaths from './find'

const startReferralPath = findPaths.offerings.show.path('refer')
const newReferralPath = startReferralPath.path('new')

const peoplePath = startReferralPath.path('people')
const findPersonPath = peoplePath.path('search')
const personPath = peoplePath.path(':prisonNumber')

export default {
  start: startReferralPath,
  new: newReferralPath,
  people: {
    find: findPersonPath,
    show: personPath,
  },
}
