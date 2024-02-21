/* istanbul ignore file */

import type { ApiConfig } from '../../config'
import config from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type {
  CreatedReferralResponse,
  Paginated,
  Referral,
  ReferralStatus,
  ReferralStatusHistory,
  ReferralUpdate,
  ReferralView,
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

  async find(
    referralId: Referral['id'],
    query?: {
      updatePerson?: string
    },
  ): Promise<Referral> {
    return (await this.restClient.get({
      path: apiPaths.referrals.show({ referralId }),
      query: {
        ...(query?.updatePerson && { updatePerson: query.updatePerson }),
      },
    })) as Referral
  }

  async findMyReferralViews(query?: {
    page?: string
    sortColumn?: string
    sortDirection?: string
    status?: string
  }): Promise<Paginated<ReferralView>> {
    return (await this.restClient.get({
      path: apiPaths.referrals.myDashboard({}),
      query: {
        ...(query?.page && { page: query.page }),
        ...(query?.status && { status: query.status }),
        ...(query?.sortColumn && { sortColumn: query.sortColumn }),
        ...(query?.sortDirection && { sortDirection: query.sortDirection }),
        size: '15',
      },
    })) as Paginated<ReferralView>
  }

  async findReferralStatusHistory(referralId: Referral['id']): Promise<Array<ReferralStatusHistory>> {
    return (await this.restClient.get({
      path: apiPaths.referrals.statusHistory({ referralId }),
    })) as Array<ReferralStatusHistory>
  }

  async findReferralViews(
    organisationId: string,
    query?: {
      audience?: string
      courseName?: string
      page?: string
      sortColumn?: string
      sortDirection?: string
      status?: string
    },
  ): Promise<Paginated<ReferralView>> {
    return (await this.restClient.get({
      path: apiPaths.referrals.dashboard({ organisationId }),
      query: {
        ...(query?.audience && { audience: query.audience }),
        ...(query?.courseName && { courseName: query.courseName }),
        ...(query?.page && { page: query.page }),
        ...(query?.sortColumn && { sortColumn: query.sortColumn }),
        ...(query?.sortDirection && { sortDirection: query.sortDirection }),
        ...(query?.status && { status: query.status }),
        size: '15',
      },
    })) as Paginated<ReferralView>
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
