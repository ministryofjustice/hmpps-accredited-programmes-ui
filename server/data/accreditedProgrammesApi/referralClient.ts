import type { ApiConfig } from '../../config'
import config from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type {
  Course,
  CourseAudience,
  CreatedReferralResponse,
  Paginated,
  Referral,
  ReferralStatus,
  ReferralSummary,
  ReferralUpdate,
} from '@accredited-programmes/models'
import type { SystemToken } from '@hmpps-auth'

export default class ReferralClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('referralClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async create(
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<CreatedReferralResponse> {
    return (await this.restClient.post({
      data: { offeringId: courseOfferingId, prisonNumber },
      path: apiPaths.referrals.create({}),
    })) as CreatedReferralResponse
  }

  async find(referralId: Referral['id']): Promise<Referral> {
    return (await this.restClient.get({
      path: apiPaths.referrals.show({ referralId }),
    })) as Referral
  }

  async findReferralSummaries(
    organisationId: string,
    query?: { audience?: CourseAudience['value']; courseName?: Course['name']; status?: string },
  ): Promise<Paginated<ReferralSummary>> {
    return (await this.restClient.get({
      path: apiPaths.referrals.dashboard({ organisationId }),
      query: {
        ...(query?.audience && { audience: query.audience }),
        ...(query?.courseName && { courseName: query.courseName }),
        ...(query?.status && { status: query.status }),
        size: '999',
      },
    })) as Paginated<ReferralSummary>
  }

  async submit(referralId: Referral['id']): Promise<void> {
    await this.restClient.post({
      path: apiPaths.referrals.submit({ referralId }),
    })
  }

  async update(referralId: Referral['id'], referralUpdate: ReferralUpdate): Promise<void> {
    await this.restClient.put({
      data: referralUpdate,
      path: apiPaths.referrals.update({ referralId }),
    })
  }

  async updateStatus(referralId: Referral['id'], status: ReferralStatus): Promise<void> {
    await this.restClient.put({
      data: { status },
      path: apiPaths.referrals.updateStatus({ referralId }),
    })
  }
}
