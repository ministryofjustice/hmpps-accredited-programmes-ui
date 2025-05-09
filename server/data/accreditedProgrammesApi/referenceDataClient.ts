/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type {
  ReferralStatus,
  ReferralStatusCategory,
  ReferralStatusRefData,
  ReferralStatusUppercase,
  ReferralStatusWithReasons,
} from '@accredited-programmes/models'
import type { ReferralStatusReason, SexualOffenceDetails } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient(
      'referenceDataClient',
      config.apis.accreditedProgrammesApi as ApiConfig,
      systemToken,
    )
  }

  async findReferralStatusCodeCategories(
    referralStatusCode: ReferralStatusUppercase,
  ): Promise<Array<ReferralStatusCategory>> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.referralStatuses.statusCodeCategories({ referralStatusCode }),
    })) as Array<ReferralStatusCategory>
  }

  async findReferralStatusCodeData(
    referralStatusCode: ReferralStatus | ReferralStatusUppercase,
  ): Promise<ReferralStatusRefData> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.referralStatuses.codeData({ referralStatusCode }),
    })) as ReferralStatusRefData
  }

  async findReferralStatusCodeReasons(
    categoryCode: Uppercase<string>,
    referralStatusCode: ReferralStatusUppercase,
    query?: {
      deselectAndKeepOpen?: boolean
    },
  ): Promise<Array<ReferralStatusReason>> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.referralStatuses.statusCodeReasons({ categoryCode, referralStatusCode }),
      query: {
        ...(query?.deselectAndKeepOpen && { deselectAndKeepOpen: 'true' }),
      },
    })) as Array<ReferralStatusReason>
  }

  async findReferralStatusCodeReasonsWithCategory(
    referralStatusCode: Extract<ReferralStatusUppercase, ReferralStatusWithReasons>,
    query?: {
      deselectAndKeepOpen?: boolean
    },
  ): Promise<Array<ReferralStatusReason>> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.referralStatuses.statusCodeReasonsWithCategories({
        referralStatusCode,
      }),
      query: {
        ...(query?.deselectAndKeepOpen && { deselectAndKeepOpen: 'true' }),
      },
    })) as Array<ReferralStatusReason>
  }

  async findReferralStatuses(): Promise<Array<ReferralStatusRefData>> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.referralStatuses.show({}),
    })) as Array<ReferralStatusRefData>
  }

  async findSexualOffenceDetails(): Promise<Array<SexualOffenceDetails>> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.sexualOffenceDetails({}),
    })) as Array<SexualOffenceDetails>
  }
}
