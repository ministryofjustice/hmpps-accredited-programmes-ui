import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { PaginatedReferralSummary, Referral, ReferralSummary } from '@accredited-programmes/api'
import type { ReferralStatusGroup } from '@accredited-programmes/ui'

interface ReferralAndScenarioOptions {
  referral: Referral
  requiredScenarioState: string
  scenarioName: string
  newScenarioState?: string
}

type QueryParameters = Record<string, { equalTo: string }>

const referralSummariesMetadata = (stubArgs: {
  queryParameters?: QueryParameters
  totalElements?: number
  totalPages?: PaginatedReferralSummary['totalPages']
}): { pageIsEmpty: boolean; pageNumber: number; pageSize: number; totalElements: number; totalPages: number } => {
  const pageNumber = Number(stubArgs.queryParameters?.page?.equalTo || 0)
  const pageSize = 15
  const totalPages = stubArgs.totalPages || 1
  const totalElements = Object.prototype.hasOwnProperty.call(stubArgs, 'totalElements')
    ? Number(stubArgs.totalElements)
    : pageSize * totalPages
  const lastPage = Math.ceil(totalElements / pageSize) - 1
  const pageIsEmpty = pageNumber > lastPage

  return { pageIsEmpty, pageNumber, pageSize, totalElements, totalPages }
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

  stubFindMyReferralSummaries: (args: {
    referralStatusGroup: ReferralStatusGroup
    referralSummaries: Array<ReferralSummary>
    queryParameters?: QueryParameters
    totalElements?: number
    totalPages?: PaginatedReferralSummary['totalPages']
  }) => {
    const { pageIsEmpty, pageNumber, pageSize, totalElements, totalPages } = referralSummariesMetadata(args)

    return stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          size: {
            equalTo: '15',
          },
          status: {
            equalTo:
              args.referralStatusGroup === 'open'
                ? 'ASSESSMENT_STARTED,AWAITING_ASSESSMENT,REFERRAL_SUBMITTED'
                : 'REFERRAL_STARTED',
          },
          ...args.queryParameters,
        },
        urlPath: apiPaths.referrals.myDashboard({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: args.referralSummaries,
          pageIsEmpty,
          pageNumber,
          pageSize,
          totalElements,
          totalPages,
        },
        status: 200,
      },
    })
  },

  stubFindReferralSummaries: (args: {
    organisationId: string
    referralSummaries: Array<ReferralSummary>
    queryParameters?: QueryParameters
    totalElements?: number
    totalPages?: PaginatedReferralSummary['totalPages']
  }): SuperAgentRequest => {
    const { pageIsEmpty, pageNumber, pageSize, totalElements, totalPages } = referralSummariesMetadata(args)

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
          pageIsEmpty,
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
