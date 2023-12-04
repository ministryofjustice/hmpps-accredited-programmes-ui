import { path } from 'static-path'

const assessPathBase = path('/assess')
const caseListPath = assessPathBase.path('referrals/case-list')
const referralShowPathBase = assessPathBase.path('referrals/:referralId')

export default {
  caseList: {
    filter: caseListPath,
    show: caseListPath,
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
