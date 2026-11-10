/* istanbul ignore file */

import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../../logger'
import config from '../../config'
import { apiPaths } from '../../paths'
import type {
  ConfirmationFields,
  Paginated,
  ReferralStatusGroup,
  ReferralStatusRefData,
  ReferralStatusUpdate,
  ReferralStatusUppercase,
  ReferralView,
} from '@accredited-programmes/models'
import type {
  HspReferralCreate,
  HspReferralDetails,
  Referral,
  ReferralStatusHistory,
  ReferralUpdate,
  TransferReferralRequest,
} from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class ReferralClient {
  restClient: RestClient

  constructor(private readonly token: SystemToken) {
    this.restClient = new RestClient('referralClient', config.apis.accreditedProgrammesApi, logger)
  }

  async create(courseOfferingId: Referral['offeringId'], prisonNumber: Referral['prisonNumber']): Promise<Referral> {
    return (await this.restClient.post(
      {
        data: { offeringId: courseOfferingId, prisonNumber },
        path: apiPaths.referrals.create({}),
      },
      this.token,
    )) as Referral
  }

  async createHspReferral(createHspBody: HspReferralCreate): Promise<Referral> {
    return (await this.restClient.post(
      {
        data: { ...createHspBody },
        path: apiPaths.referrals.createHsp({}),
      },
      this.token,
    )) as Referral
  }

  async deleteReferral(referralId: Referral['id']): Promise<void> {
    await this.restClient.delete(
      {
        path: apiPaths.referrals.delete({ referralId }),
      },
      this.token,
    )
  }

  async find(
    referralId: Referral['id'],
    query?: {
      updatePerson?: string
    },
  ): Promise<Referral> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.show({ referralId }),
        query: {
          ...(query?.updatePerson && { updatePerson: query.updatePerson }),
        },
      },
      this.token,
    )) as Referral
  }

  async findConfirmationText(
    referralId: Referral['id'],
    chosenStatusCode: ReferralStatusUppercase,
    query?: {
      deselectAndKeepOpen?: boolean
      ptUser?: boolean
    },
  ): Promise<ConfirmationFields> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.confirmationText({ chosenStatusCode, referralId }),
        query: {
          ...(query?.deselectAndKeepOpen && { deselectAndKeepOpen: 'true' }),
          ...(query?.ptUser && { ptUser: 'true' }),
        },
      },
      this.token,
    )) as ConfirmationFields
  }

  async findDuplicateReferrals(offeringId: string, prisonNumber: Referral['prisonNumber']): Promise<Array<Referral>> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.duplicates({}),
        query: {
          offeringId,
          prisonNumber,
        },
      },
      this.token,
    )) as Array<Referral>
  }

  async findHspReferralDetails(referralId: Referral['id']): Promise<HspReferralDetails> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.hspDetails({ referralId }),
      },
      this.token,
    )) as HspReferralDetails
  }

  async findHspReferralViews(query?: {
    nameOrId?: string
    page?: string
    sortColumn?: string
    sortDirection?: string
    status?: string
    statusGroup?: ReferralStatusGroup
  }): Promise<Paginated<ReferralView>> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.hspReferralDashboard({}),
        query: {
          ...(query?.nameOrId && { nameOrId: query.nameOrId }),
          ...(query?.page && { page: query.page }),
          ...(query?.status && { status: query.status }),
          ...(query?.statusGroup && { statusGroup: query.statusGroup }),
          ...(query?.sortColumn && { sortColumn: query.sortColumn }),
          ...(query?.sortDirection && { sortDirection: query.sortDirection }),
          size: '15',
        },
      },
      this.token,
    )) as Paginated<ReferralView>
  }

  async findMyReferralViews(query?: {
    nameOrId?: string
    page?: string
    sortColumn?: string
    sortDirection?: string
    status?: string
    statusGroup?: ReferralStatusGroup
  }): Promise<Paginated<ReferralView>> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.myDashboard({}),
        query: {
          ...(query?.nameOrId && { nameOrId: query.nameOrId }),
          ...(query?.page && { page: query.page }),
          ...(query?.status && { status: query.status }),
          ...(query?.statusGroup && { statusGroup: query.statusGroup }),
          ...(query?.sortColumn && { sortColumn: query.sortColumn }),
          ...(query?.sortDirection && { sortDirection: query.sortDirection }),
          size: '15',
        },
      },
      this.token,
    )) as Paginated<ReferralView>
  }

  async findOtherReferrals(referralId: Referral['id']): Promise<Array<Referral>> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.otherReferrals({ referralId }),
      },
      this.token,
    )) as Array<Referral>
  }

  async findReferralStatusHistory(referralId: Referral['id']): Promise<Array<ReferralStatusHistory>> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.statusHistory({ referralId }),
      },
      this.token,
    )) as Array<ReferralStatusHistory>
  }

  async findReferralViews(
    organisationId: string,
    query?: {
      audience?: string
      courseName?: string
      hasLdcString?: string
      nameOrId?: string
      page?: string
      sortColumn?: string
      sortDirection?: string
      status?: string
      statusGroup?: ReferralStatusGroup
    },
  ): Promise<Paginated<ReferralView>> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.dashboard({ organisationId }),
        query: {
          ...(query?.audience && { audience: query.audience }),
          ...(query?.courseName && { courseName: query.courseName }),
          ...(query?.nameOrId && { nameOrId: query.nameOrId }),
          ...(query?.page && { page: query.page }),
          ...(query?.sortColumn && { sortColumn: query.sortColumn }),
          ...(query?.sortDirection && { sortDirection: query.sortDirection }),
          ...(query?.status && { status: query.status }),
          ...(query?.statusGroup && { statusGroup: query.statusGroup }),
          ...(query?.hasLdcString && { hasLdc: query.hasLdcString }),
          size: '15',
        },
      },
      this.token,
    )) as Paginated<ReferralView>
  }

  async findStatusTransitions(
    referralId: Referral['id'],
    query?: {
      deselectAndKeepOpen?: boolean
      ptUser?: boolean
    },
  ): Promise<Array<ReferralStatusRefData>> {
    return (await this.restClient.get(
      {
        path: apiPaths.referrals.statusTransitions({ referralId }),
        query: {
          ...(query?.deselectAndKeepOpen && { deselectAndKeepOpen: 'true' }),
          ...(query?.ptUser && { ptUser: 'true' }),
        },
      },
      this.token,
    )) as Array<ReferralStatusRefData>
  }

  async submit(referralId: Referral['id']): Promise<void> {
    await this.restClient.post(
      {
        path: apiPaths.referrals.submit({ referralId }),
      },
      this.token,
    )
  }

  async transferToBuildingChoices(transferRequest: TransferReferralRequest): Promise<Referral> {
    return (await this.restClient.post(
      {
        data: { ...transferRequest },
        path: apiPaths.referrals.transfer({}),
      },
      this.token,
    )) as Referral
  }

  async update(referralId: Referral['id'], referralUpdate: ReferralUpdate): Promise<void> {
    await this.restClient.put(
      {
        data: { ...referralUpdate },
        path: apiPaths.referrals.update({ referralId }),
      },
      this.token,
    )
  }

  async updateStatus(referralId: Referral['id'], referralStatusUpdate: ReferralStatusUpdate): Promise<void> {
    await this.restClient.put(
      {
        data: referralStatusUpdate,
        path: apiPaths.referrals.updateStatus({ referralId }),
      },
      this.token,
    )
  }
}
