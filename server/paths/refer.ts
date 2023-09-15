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
const confirmOasysPath = showReferralPath.path('confirm-oasys')
const reasonForReferralPath = showReferralPath.path('reason')
const checkAnswersPath = showReferralPath.path('check-answers')
const completeReferralPath = showReferralPath.path('complete')
const submitReferralPath = showReferralPath.path('submit')

export default {
  checkAnswers: checkAnswersPath,
  complete: completeReferralPath,
  confirmOasys: {
    show: confirmOasysPath,
    update: confirmOasysPath,
  },
  create: referralsPath,
  new: newReferralPath,
  people: {
    find: findPersonPath,
    show: personPath,
  },
  reason: {
    show: reasonForReferralPath,
    update: reasonForReferralPath,
  },
  show: showReferralPath,
  showPerson: referralPersonPath,
  start: startReferralPath,
  submit: submitReferralPath,
  update: showReferralPath,
}
