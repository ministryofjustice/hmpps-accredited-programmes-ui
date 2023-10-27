import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { Referral } from '@accredited-programmes/models'

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
