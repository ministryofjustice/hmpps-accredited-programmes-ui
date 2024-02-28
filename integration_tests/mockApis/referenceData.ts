import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type {
  ReferralStatusCategory,
  ReferralStatusReason,
  ReferralStatusUppercase,
} from '@accredited-programmes/models'

export default {
  stubReferalStatusCodeCategories: (args: {
    categories: Array<ReferralStatusCategory>
    referralStatus: ReferralStatusUppercase
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referenceData.referralStatuses.statusCodeCategories({ referralStatusCode: args.referralStatus }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.categories,
        status: 200,
      },
    }),

  stubReferralStatusCodeReasons: (args: {
    reasons: Array<ReferralStatusReason>
    referralStatus: ReferralStatusUppercase
    referralStatusCategoryCode: ReferralStatusCategory['code']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referenceData.referralStatuses.statusCodeReasons({
          categoryCode: args.referralStatusCategoryCode,
          referralStatusCode: args.referralStatus,
        }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.reasons,
        status: 200,
      },
    }),
}
