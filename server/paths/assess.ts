import { path } from 'static-path'

const assessPathBase = path('/assess')
const referralShowPathBase = assessPathBase.path('referrals/:referralId')

export default {
  show: {
    additionalInformation: referralShowPathBase.path('additional-information'),
    personalDetails: referralShowPathBase.path('personal-details'),
    programmeHistory: referralShowPathBase.path('programme-history'),
    sentenceInformation: referralShowPathBase.path('sentence-information'),
  },
}
