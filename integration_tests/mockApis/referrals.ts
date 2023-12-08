import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { Paginated, Referral, ReferralSummary } from '@accredited-programmes/models'

interface ReferralAndScenarioOptions {
  referral: Referral
  requiredScenarioState: string
  scenarioName: string
  newScenarioState?: string
}

export default {
  stubCreateReferral: (referral: Referral): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: apiPaths.referrals.create({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { referralId: referral.id },
        status: 201,
      },
    }),

  stubFindReferralSummaries: (args: {
    organisationId: string
    referralSummaries: Array<ReferralSummary>
    queryParameters?: Record<string, { equalTo: string }>
    totalElements?: number
    totalPages?: Paginated<ReferralSummary>['totalPages']
  }): SuperAgentRequest => {
    const pageNumber = Number(args.queryParameters?.page?.equalTo || 0)
    const pageSize = 15
    const totalPages = args.totalPages || 1
    const totalElements = Object.prototype.hasOwnProperty.call(args, 'totalElements')
      ? Number(args.totalElements)
      : pageSize * totalPages
    const lastPage = Math.ceil(totalElements / pageSize) - 1

    return stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          size: {
            equalTo: '15',
          },
          ...args.queryParameters,
        },
        urlPath: apiPaths.referrals.dashboard({ organisationId: 'MRI' }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: args.referralSummaries,
          pageIsEmpty: pageNumber > lastPage,
          pageNumber,
          pageSize,
          totalElements,
          totalPages,
        },
        status: 200,
      },
    })
  },

  stubReferral: (referral: Referral): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referrals.show({ referralId: referral.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referral,
        status: 200,
      },
    }),

  stubReferralWithScenario: ({
    newScenarioState,
    referral,
    requiredScenarioState,
    scenarioName,
  }: ReferralAndScenarioOptions): SuperAgentRequest =>
    stubFor({
      newScenarioState,
      request: {
        method: 'GET',
        url: apiPaths.referrals.show({ referralId: referral.id }),
      },
      requiredScenarioState,
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referral,
        status: 200,
      },
      scenarioName,
    }),

  stubSubmitReferral: (referralId: Referral['id']): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: apiPaths.referrals.submit({ referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 204,
      },
    }),

  stubUpdateReferral: (referralId: Referral['id']): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: apiPaths.referrals.update({ referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 204,
      },
    }),

  stubUpdateReferralStatus: (referralId: Referral['id']): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: apiPaths.referrals.updateStatus({ referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 204,
      },
    }),
}
