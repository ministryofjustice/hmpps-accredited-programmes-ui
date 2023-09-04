import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { apiPaths } from '../paths'
import type { CreatedReferralResponse, Referral, ReferralUpdate } from '@accredited-programmes/models'

export default class ReferralClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
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

  async find(referralId: Referral['id']): Promise<Referral> {
    return (await this.restClient.get({
      path: apiPaths.referrals.show({ referralId }),
    })) as Referral
  }

  async update(referralId: Referral['id'], referralUpdate: ReferralUpdate): Promise<void> {
    await this.restClient.put({
      data: referralUpdate,
      path: apiPaths.referrals.update({ referralId }),
    })
  }
}
