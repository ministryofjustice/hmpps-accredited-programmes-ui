import { path } from 'static-path'

const assessPathBase = path('/assess')
const caseListIndex = assessPathBase.path('referrals/case-list')
const courseCaseListPath = assessPathBase.path('referrals/:courseName/case-list')
const referralShowPathBase = assessPathBase.path('referrals/:referralId')

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
    sentenceInformation: referralShowPathBase.path('sentence-information'),
  },
}

export { assessPathBase }
