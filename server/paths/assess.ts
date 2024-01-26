import { path } from 'static-path'

const assessPathBase = path('/assess')
const caseListIndex = assessPathBase.path('referrals/case-list')
const courseCaseListPath = assessPathBase.path('referrals/:courseName/case-list')
const referralShowPathBase = assessPathBase.path('referrals/:referralId')

const risksAndNeedsPathBase = referralShowPathBase.path('risks-and-needs')

export default {
  caseList: {
    filter: courseCaseListPath,
    index: caseListIndex,
    show: courseCaseListPath,
  },
  show: {
    additionalInformation: referralShowPathBase.path('additional-information'),
    offenceHistory: referralShowPathBase.path('offence-history'),
    personalDetails: referralShowPathBase.path('personal-details'),
    programmeHistory: referralShowPathBase.path('programme-history'),
    risksAndNeeds: {
      attitudes: risksAndNeedsPathBase.path('attitudes'),
      emotionalWellbeing: risksAndNeedsPathBase.path('emotional-wellbeing'),
      learningNeeds: risksAndNeedsPathBase.path('learning-needs'),
      lifestyleAndAssociates: risksAndNeedsPathBase.path('lifestyle-and-associates'),
      offenceAnalysis: risksAndNeedsPathBase.path('offence-analysis'),
      relationships: risksAndNeedsPathBase.path('relationships'),
      risksAndAlerts: risksAndNeedsPathBase.path('risks-and-alerts'),
      roshAnalysis: risksAndNeedsPathBase.path('rosh-analysis'),
      thinkingAndBehaving: risksAndNeedsPathBase.path('thinking-and-behaving'),
    },
    sentenceInformation: referralShowPathBase.path('sentence-information'),
  },
}

export { assessPathBase }
