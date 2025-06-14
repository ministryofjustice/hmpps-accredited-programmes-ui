import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type {
  ConfirmationFields,
  Paginated,
  ReferralStatusGroup,
  ReferralStatusRefData,
  ReferralView,
} from '@accredited-programmes/models'
import type {
  CourseOffering,
  HspReferralDetails,
  PeopleSearchResponse,
  Referral,
  ReferralStatusHistory,
  TransferReferralRequest,
} from '@accredited-programmes-api'

interface ReferralAndScenarioOptions {
  referral: Referral
  requiredScenarioState: string
  scenarioName: string
  newScenarioState?: string
}

type QueryParameters = Record<string, { equalTo: string }>

const referralViewsMetadata = (stubArgs: {
  queryParameters?: QueryParameters
  totalElements?: number
  totalPages?: Paginated<ReferralView>['totalPages']
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
  stubConfirmationText: (args: {
    chosenStatusCode: ReferralStatusRefData['code']
    confirmationText: ConfirmationFields
    queryParameters: QueryParameters
    referralId: Referral['id']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        queryParameters: args.queryParameters,
        urlPath: apiPaths.referrals.confirmationText({
          chosenStatusCode: args.chosenStatusCode,
          referralId: args.referralId,
        }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.confirmationText,
        status: 200,
      },
    }),

  stubCreateReferral: (args: { referral: Referral; status?: number }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: apiPaths.referrals.create({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.referral,
        status: args.status || 201,
      },
    }),

  stubDeleteReferral: (referralId: Referral['id']): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'DELETE',
        url: apiPaths.referrals.delete({ referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 204,
      },
    }),

  stubFindDuplicates: (args: {
    offeringId: CourseOffering['id']
    prisonNumber: PeopleSearchResponse['prisonerNumber']
    referrals: Array<Referral>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          offeringId: { equalTo: args.offeringId },
          prisonNumber: { equalTo: args.prisonNumber },
        },
        urlPath: apiPaths.referrals.duplicates({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.referrals,
        status: 200,
      },
    }),

  stubFindMyReferralViews: (args: {
    referralViews: Array<ReferralView>
    statusGroup: ReferralStatusGroup
    queryParameters?: QueryParameters
    totalElements?: number
    totalPages?: Paginated<ReferralView>['totalPages']
  }) => {
    const { pageIsEmpty, pageNumber, pageSize, totalElements, totalPages } = referralViewsMetadata(args)

    return stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          size: {
            equalTo: '15',
          },
          ...args.queryParameters,
        },
        urlPath: apiPaths.referrals.myDashboard({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: args.referralViews,
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

  stubFindReferralViews: (args: {
    organisationId: string
    referralViews: Array<ReferralView>
    queryParameters?: QueryParameters
    totalElements?: number
    totalPages?: Paginated<ReferralView>['totalPages']
  }): SuperAgentRequest => {
    const { pageIsEmpty, pageNumber, pageSize, totalElements, totalPages } = referralViewsMetadata(args)

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
          content: args.referralViews,
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

  stubHspReferralDetails: (args: {
    hspReferralDetails: HspReferralDetails
    referralId: Referral['id']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referrals.hspDetails({ referralId: args.referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.hspReferralDetails,
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

  stubStatusHistory: (args: {
    referralId: Referral['id']
    statusHistory: Array<ReferralStatusHistory>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referrals.statusHistory({ referralId: args.referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.statusHistory,
        status: 200,
      },
    }),

  stubStatusTransitions: (args: {
    referralId: Referral['id']
    statusTransitions: Array<ReferralStatusRefData>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referrals.statusTransitions({ referralId: args.referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.statusTransitions,
        status: 200,
      },
    }),

  stubSubmitReferral: (args: { body: Referral; referralId: Referral['id']; status?: number }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: apiPaths.referrals.submit({ referralId: args.referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.body,
        status: args.status || 200,
      },
    }),

  stubTransferReferral: (args: { newReferral: Referral; requestBody: TransferReferralRequest }): SuperAgentRequest =>
    stubFor({
      request: {
        bodyPatterns: [{ equalToJson: args.requestBody }],
        method: 'POST',
        url: apiPaths.referrals.transfer({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.newReferral,
        status: 200,
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
