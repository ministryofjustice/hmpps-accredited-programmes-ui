/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type {
  ReferralStatus,
  ReferralStatusCategory,
  ReferralStatusReason,
  ReferralStatusRefData,
  ReferralStatusUppercase,
} from '@accredited-programmes/models'
import type { SystemToken } from '@hmpps-auth'

export default class ReferenceDataClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('oasysClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
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
  ): Promise<Array<ReferralStatusReason>> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.referralStatuses.statusCodeReasons({ categoryCode, referralStatusCode }),
    })) as Array<ReferralStatusReason>
  }

  async findReferralStatuses(): Promise<Array<ReferralStatusRefData>> {
    return (await this.restClient.get({
      path: apiPaths.referenceData.referralStatuses.show({}),
    })) as Array<ReferralStatusRefData>
  }
}
