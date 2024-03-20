import { path } from 'static-path'

const assessPathBase = path('/assess')
const caseListIndex = assessPathBase.path('referrals/case-list')
const courseCaseListPath = assessPathBase.path('referrals/:courseName/case-list')
const referralShowPathBase = assessPathBase.path('referrals/:referralId')

const risksAndNeedsPathBase = referralShowPathBase.path('risks-and-needs')

const updateStatusPathBase = referralShowPathBase.path('update-status')
const updateStatusSelectCategory = updateStatusPathBase.path('category')
const updateStatusSelectReason = updateStatusPathBase.path('reason')
const updateStatusSelectionShowPath = updateStatusPathBase.path('selection')

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
    programmeHistory: referralShowPathBase.path('programme-history'),
    risksAndNeeds: {
      attitudes: risksAndNeedsPathBase.path('attitudes'),
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
    decision: {
      show: updateStatusPathBase,
      submit: updateStatusPathBase,
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
