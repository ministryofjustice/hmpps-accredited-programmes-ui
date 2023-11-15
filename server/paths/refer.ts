import { path } from 'static-path'

import findPaths from './find'

const offeringReferralPathBase = findPaths.offerings.show.path('referrals')
const newReferralPeoplePathBase = offeringReferralPathBase.path('people')

const referPathBase = path('/refer')

const newReferralsPath = referPathBase.path('referrals/new')
const newReferralShowPath = newReferralsPath.path(':referralId')
const newReferralProgrammeHistoryPath = newReferralShowPath.path('programme-history')
const newReferralProgrammeHistoryShowPath = newReferralProgrammeHistoryPath.path(':courseParticipationId')
const newReferralProgrammeHistoryProgrammePath = newReferralProgrammeHistoryShowPath.path('programme')
const newReferralConfirmOasysPath = newReferralShowPath.path('confirm-oasys')
const newReferralAdditionalInformationPath = newReferralShowPath.path('additional-information')

const referralShowPathBase = referPathBase.path('referrals/:referralId')

export default {
  new: {
    additionalInformation: {
      show: newReferralAdditionalInformationPath,
      update: newReferralAdditionalInformationPath,
    },
    checkAnswers: newReferralShowPath.path('check-answers'),
    complete: newReferralShowPath.path('complete'),
    confirmOasys: {
      show: newReferralConfirmOasysPath,
      update: newReferralConfirmOasysPath,
    },
    create: newReferralsPath,
    new: offeringReferralPathBase.path('new'),
    people: {
      find: newReferralPeoplePathBase.path('search'),
      show: newReferralPeoplePathBase.path(':prisonNumber'),
    },
    programmeHistory: {
      create: newReferralProgrammeHistoryPath,
      delete: newReferralProgrammeHistoryShowPath.path('delete'),
      destroy: newReferralProgrammeHistoryShowPath,
      details: {
        show: newReferralProgrammeHistoryShowPath.path('details'),
        update: newReferralProgrammeHistoryShowPath,
      },
      editProgramme: newReferralProgrammeHistoryProgrammePath,
      index: newReferralProgrammeHistoryPath,
      new: newReferralProgrammeHistoryPath.path('new'),
      updateProgramme: newReferralProgrammeHistoryProgrammePath,
      updateReviewedStatus: newReferralProgrammeHistoryPath,
    },
    show: newReferralShowPath,
    showPerson: newReferralShowPath.path('person'),
    start: offeringReferralPathBase.path('start'),
    submit: newReferralShowPath.path('submit'),
    update: newReferralShowPath,
  },
  show: {
    additionalInformation: referralShowPathBase.path('additional-information'),
    personalDetails: referralShowPathBase.path('personal-details'),
    programmeHistory: referralShowPathBase.path('programme-history'),
    sentenceInformation: referralShowPathBase.path('sentence-information'),
  },
}

export { referPathBase }
