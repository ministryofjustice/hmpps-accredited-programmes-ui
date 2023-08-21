import { path } from 'static-path'

import findPaths from './find'

const startReferralPath = findPaths.offerings.show.path('refer')
const newReferralPath = startReferralPath.path('new')
const showReferralPath = findPaths.offerings.show.path('referrals/:referralId')

const peoplePath = startReferralPath.path('people')
const findPersonPath = peoplePath.path('search')
const personPath = peoplePath.path(':prisonNumber')

const referralsPath = path('/referrals')

export default {
  create: referralsPath,
  new: newReferralPath,
  people: {
    find: findPersonPath,
    show: personPath,
  },
  show: showReferralPath,
  start: startReferralPath,
}
