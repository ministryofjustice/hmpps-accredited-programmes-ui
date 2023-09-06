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
const referralPersonPath = showReferralPath.path('person')
const confirmOasysPath = showReferralPath.path('oasys-confirmed')
const checkAnswersPath = showReferralPath.path('check-answers')

export default {
  checkAnswers: checkAnswersPath,
  confirmOasys: confirmOasysPath,
  create: referralsPath,
  new: newReferralPath,
  people: {
    find: findPersonPath,
    show: personPath,
  },
  show: showReferralPath,
  showPerson: referralPersonPath,
  start: startReferralPath,
  update: showReferralPath,
}
