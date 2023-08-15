import findPaths from './find'

const startReferralPath = findPaths.offerings.show.path('refer')
const peoplePath = startReferralPath.path('people')
const personPath = peoplePath.path(':prisonNumber')

export default {
  start: startReferralPath,
  people: {
    show: personPath,
  },
}
