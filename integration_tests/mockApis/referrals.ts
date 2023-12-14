import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { Referral, ReferralSummary } from '@accredited-programmes/models'

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
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          size: {
            equalTo: '999',
          },
          ...args.queryParameters,
        },
        urlPath: apiPaths.referrals.dashboard({ organisationId: 'MRI' }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: args.referralSummaries,
          pageIsEmpty: false,
          pageNumber: 0,
          pageSize: 10,
          totalElements: args.referralSummaries.length,
          totalPages: 1,
        },
        status: 200,
      },
    }),

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
