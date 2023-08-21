import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { apiPaths } from '../paths'
import type { CreatedReferralResponse, Referral } from '@accredited-programmes/models'

export default class ReferralClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('referralClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async create(
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
    referrerId: Referral['referrerId'],
  ): Promise<CreatedReferralResponse> {
    return (await this.restClient.post({
      data: { offeringId: courseOfferingId, prisonNumber, referrerId },
      path: apiPaths.referrals.create({}),
    })) as CreatedReferralResponse
  }
}
