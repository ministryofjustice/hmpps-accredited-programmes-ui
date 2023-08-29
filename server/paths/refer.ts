import { path } from 'static-path'

import findPaths from './find'

const startReferralPath = findPaths.offerings.show.path('refer')
const newReferralPath = startReferralPath.path('new')

const peoplePath = startReferralPath.path('people')
const findPersonPath = peoplePath.path('search')
const personPath = peoplePath.path(':prisonNumber')

const referralsPath = path('/referrals')
const showReferralPath = referralsPath.path(':referralId')

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
