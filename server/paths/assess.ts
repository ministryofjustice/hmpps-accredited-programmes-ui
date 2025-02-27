import { path } from 'static-path'

const assessPathBase = path('/assess')
const caseListIndex = assessPathBase.path('referrals/case-list')
const courseCaseListPath = assessPathBase.path('referrals/course/:courseId/case-list')
const referralShowPathBase = assessPathBase.path('referrals/:referralId')

const risksAndNeedsPathBase = referralShowPathBase.path('risks-and-needs')
const showProgrammeHistoryPath = referralShowPathBase.path('programme-history')

const updateStatusPathBase = referralShowPathBase.path('update-status')
const updateStatusSelectDecision = updateStatusPathBase.path('decision')
const updateStatusSelectCategory = updateStatusPathBase.path('category')
const updateStatusSelectReason = updateStatusPathBase.path('reason')
const updateStatusSelectionShowPath = updateStatusPathBase.path('selection')

const moveToBuildingChoicesPathBase = referralShowPathBase.path('move-to-building-choices')
const moveToBuildingChoicesReason = moveToBuildingChoicesPathBase.path('reason')
const moveToBuildingChoicesDuplicate = moveToBuildingChoicesPathBase.path('duplicate')

export default {
  caseList: {
    filter: courseCaseListPath.path(':referralStatusGroup'),
    index: caseListIndex,
    show: courseCaseListPath.path(':referralStatusGroup'),
  },
  show: {
    additionalInformation: referralShowPathBase.path('additional-information'),
    offenceHistory: referralShowPathBase.path('offence-history'),
    personalDetails: referralShowPathBase.path('personal-details'),
    pni: referralShowPathBase.path('pni'),
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
  transferToBuildingChoices: {
    reason: {
      duplicate: moveToBuildingChoicesDuplicate,
      show: moveToBuildingChoicesReason,
    },
  },
  updateStatus: {
    category: {
      show: updateStatusSelectCategory,
      submit: updateStatusSelectCategory,
    },
    decision: {
      show: updateStatusSelectDecision,
      submit: updateStatusSelectDecision,
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
}

export { assessPathBase }
