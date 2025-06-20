import { path } from 'static-path'

import findPaths from './find'

const offeringReferralPathBase = findPaths.offerings.show.path('referrals')
const newReferralPeoplePathBase = offeringReferralPathBase.path('people')

const referPathBase = path('/refer')

const referralsPath = referPathBase.path('referrals')

const caseListPath = referralsPath.path('case-list')

const newReferralsPath = referralsPath.path('new')
const newReferralShowPath = newReferralsPath.path(':referralId')
const newReferralProgrammeHistoryPath = newReferralShowPath.path('programme-history')
const newReferralProgrammeHistoryShowPath = newReferralProgrammeHistoryPath.path(':courseParticipationId')
const newReferralProgrammeHistoryProgrammePath = newReferralProgrammeHistoryShowPath.path('programme')
const newReferralConfirmOasysPath = newReferralShowPath.path('confirm-oasys')
const newReferralAdditionalInformationPath = newReferralShowPath.path('additional-information')

const referralShowPathBase = referralsPath.path(':referralId')

const risksAndNeedsPathBase = referralShowPathBase.path('risks-and-needs')
const showProgrammeHistoryPath = referralShowPathBase.path('programme-history')

const updateStatusPathBase = referralShowPathBase.path('update-status')
const updateStatusSelectCategory = updateStatusPathBase.path('category')
const updateStatusSelectReason = updateStatusPathBase.path('reason')
const updateStatusSelectionShowPath = updateStatusPathBase.path('selection')

export default {
  caseList: {
    filter: caseListPath.path(':referralStatusGroup'),
    index: caseListPath,
    show: caseListPath.path(':referralStatusGroup'),
  },
  manageHold: referralShowPathBase.path('manage-hold'),
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
    delete: newReferralShowPath.path('delete'),
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
      show: newReferralProgrammeHistoryShowPath,
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
    duplicate: referralShowPathBase.path('duplicate'),
    hspDetails: referralShowPathBase.path('hsp-details'),
    offenceHistory: referralShowPathBase.path('offence-history'),
    otherReferrals: referralShowPathBase.path('other-referrals'),
    personalDetails: referralShowPathBase.path('personal-details'),
    programmeHistory: showProgrammeHistoryPath,
    programmeHistoryDetail: showProgrammeHistoryPath.path(':courseParticipationId'),
    releaseDates: referralShowPathBase.path('release-dates'),
    risksAndNeeds: {
      alcoholMisuse: risksAndNeedsPathBase.path('alcohol-misuse'),
      attitudes: risksAndNeedsPathBase.path('attitudes'),
      drugMisuse: risksAndNeedsPathBase.path('drug-misuse'),
      emotionalWellbeing: risksAndNeedsPathBase.path('emotional-wellbeing'),
      health: risksAndNeedsPathBase.path('health'),
      learningNeeds: risksAndNeedsPathBase.path('learning-needs'),
      lifestyleAndAssociates: risksAndNeedsPathBase.path('lifestyle-and-associates'),
      offenceAnalysis: risksAndNeedsPathBase.path('offence-analysis'),
      relationships: risksAndNeedsPathBase.path('relationships'),
      risksAndAlerts: risksAndNeedsPathBase.path('risks-and-alerts'),
      roshAnalysis: risksAndNeedsPathBase.path('rosh-analysis'),
      thinkingAndBehaving: risksAndNeedsPathBase.path('thinking-and-behaving'),
    },
    sentenceInformation: referralShowPathBase.path('sentence-information'),
    statusHistory: referralShowPathBase.path('status-history'),
  },
  updateStatus: {
    category: {
      show: updateStatusSelectCategory,
      submit: updateStatusSelectCategory,
    },
    reason: {
      show: updateStatusSelectReason,
      submit: updateStatusSelectReason,
    },
    selection: {
      confirmation: {
        submit: updateStatusSelectionShowPath.path('confirmation'),
      },
      reason: {
        submit: updateStatusSelectionShowPath.path('reason'),
      },
      show: updateStatusSelectionShowPath,
    },
  },
  withdraw: referralShowPathBase.path('withdraw'),
}

export { referPathBase }
