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
const programmeHistoryPath = showReferralPath.path('programme-history')
const newProgrammeHistoryPath = programmeHistoryPath.path('new')
const showProgrammeHistoryPath = programmeHistoryPath.path(':courseParticipationId')
const programmeHistoryProgrammePath = showProgrammeHistoryPath.path('programme')
const programmeHistoryDetailsPath = showProgrammeHistoryPath.path('details')
const deleteProgrammeHistoryPath = showProgrammeHistoryPath.path('delete')
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
  programmeHistory: {
    create: programmeHistoryPath,
    delete: deleteProgrammeHistoryPath,
    details: {
      show: programmeHistoryDetailsPath,
      update: programmeHistoryDetailsPath,
    },
    editProgramme: programmeHistoryProgrammePath,
    index: programmeHistoryPath,
    new: newProgrammeHistoryPath,
    updateProgramme: programmeHistoryProgrammePath,
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
