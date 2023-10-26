import { path } from 'static-path'

import findPaths from './find'

const offeringReferralPathBase = findPaths.offerings.show.path('referrals')
const startReferralPath = offeringReferralPathBase.path('start')
const newReferralPath = offeringReferralPathBase.path('new')

const peoplePathBase = offeringReferralPathBase.path('people')
const findPersonPath = peoplePathBase.path('search')
const personPath = peoplePathBase.path(':prisonNumber')

const referBasePath = path('/refer')

const draftReferralsPath = referBasePath.path('new/referrals')
const showDraftReferralPath = draftReferralsPath.path(':referralId')
const referralPersonPath = showDraftReferralPath.path('person')
const programmeHistoryPath = showDraftReferralPath.path('programme-history')
const newProgrammeHistoryPath = programmeHistoryPath.path('new')
const showProgrammeHistoryPath = programmeHistoryPath.path(':courseParticipationId')
const programmeHistoryProgrammePath = showProgrammeHistoryPath.path('programme')
const programmeHistoryDetailsPath = showProgrammeHistoryPath.path('details')
const deleteProgrammeHistoryPath = showProgrammeHistoryPath.path('delete')
const confirmOasysPath = showDraftReferralPath.path('confirm-oasys')
const additionalInformationPath = showDraftReferralPath.path('additional-information')
const checkAnswersPath = showDraftReferralPath.path('check-answers')
const completeReferralPath = showDraftReferralPath.path('complete')
const submitReferralPath = showDraftReferralPath.path('submit')

export default {
  additionalInformation: {
    show: additionalInformationPath,
    update: additionalInformationPath,
  },
  checkAnswers: checkAnswersPath,
  complete: completeReferralPath,
  confirmOasys: {
    show: confirmOasysPath,
    update: confirmOasysPath,
  },
  create: draftReferralsPath,
  new: newReferralPath,
  people: {
    find: findPersonPath,
    show: personPath,
  },
  programmeHistory: {
    create: programmeHistoryPath,
    delete: deleteProgrammeHistoryPath,
    destroy: showProgrammeHistoryPath,
    details: {
      show: programmeHistoryDetailsPath,
      update: programmeHistoryDetailsPath,
    },
    editProgramme: programmeHistoryProgrammePath,
    index: programmeHistoryPath,
    new: newProgrammeHistoryPath,
    updateProgramme: programmeHistoryProgrammePath,
    updateReviewedStatus: programmeHistoryPath,
  },
  show: showDraftReferralPath,
  showPerson: referralPersonPath,
  start: startReferralPath,
  submit: submitReferralPath,
  update: showDraftReferralPath,
}
