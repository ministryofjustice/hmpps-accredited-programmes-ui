import { path } from 'static-path'

import findPaths from './find'

const offeringReferralPathBase = findPaths.offerings.show.path('referrals')
const startReferralPath = offeringReferralPathBase.path('start')
const newReferralPath = offeringReferralPathBase.path('new')

const peoplePathBase = offeringReferralPathBase.path('people')
const findPersonPath = peoplePathBase.path('search')
const personPath = peoplePathBase.path(':prisonNumber')

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
