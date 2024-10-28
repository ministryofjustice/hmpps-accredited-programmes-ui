import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type {
  ReferralStatusCategory,
  ReferralStatusReason,
  ReferralStatusRefData,
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

  stubReferralStatusCodeData: (referralStatus: ReferralStatusRefData): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referenceData.referralStatuses.codeData({ referralStatusCode: referralStatus.code }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referralStatus,
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

  stubReferralStatusCodeReasonsWithCategory: (args: {
    reasons: Array<ReferralStatusReason>
    referralStatus: ReferralStatusUppercase
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referenceData.referralStatuses.statusCodeReasonsWithCategories({
          referralStatusCode: args.referralStatus,
        }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.reasons,
        status: 200,
      },
    }),

  stubReferralStatuses: (referralStatuses: Array<ReferralStatusRefData>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referenceData.referralStatuses.show({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referralStatuses,
        status: 200,
      },
    }),
}
