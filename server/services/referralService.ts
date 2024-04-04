import type UserService from './userService'
import logger from '../../logger'
import type { HmppsAuthClient, ReferralClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  ConfirmationFields,
  CreatedReferralResponse,
  Organisation,
  Paginated,
  Referral,
  ReferralStatusGroup,
  ReferralStatusRefData,
  ReferralStatusUpdate,
  ReferralStatusUppercase,
  ReferralUpdate,
  ReferralView,
} from '@accredited-programmes/models'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { User } from '@manage-users-api'

export default class ReferralService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly referralClientBuilder: RestClientBuilder<ReferralClient>,
    private readonly userService: UserService,
  ) {}

  async createReferral(
    username: Express.User['username'],
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<CreatedReferralResponse> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.create(courseOfferingId, prisonNumber)
  }

  async getConfirmationText(
    username: Express.User['username'],
    referralId: Referral['id'],
    chosenStatusCode: ReferralStatusUppercase,
    query?: {
      deselectAndKeepOpen?: boolean
      ptUser?: boolean
    },
  ): Promise<ConfirmationFields> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findConfirmationText(referralId, chosenStatusCode, query)
  }

  async getMyReferralViews(
    username: Express.User['username'],
    query?: {
      page?: string
      sortColumn?: string
      sortDirection?: string
      status?: string
      statusGroup?: ReferralStatusGroup
    },
  ): Promise<Paginated<ReferralView>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findMyReferralViews(query)
  }

  async getNumberOfTasksCompleted(username: Express.User['username'], referralId: Referral['id']): Promise<number> {
    const referralProgressIndicatorKeys = [
      'additionalInformation',
      'hasReviewedProgrammeHistory',
      'oasysConfirmed',
      'prisonNumber',
    ] as const

    const referral = await this.getReferral(username, referralId)

    return referralProgressIndicatorKeys.filter(item => referral[item]).length
  }

  async getReferral(
    username: Express.User['username'],
    referralId: Referral['id'],
    query?: { updatePerson?: string },
  ): Promise<Referral> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.find(referralId, query)
  }

  async getReferralStatusHistory(
    userToken: Express.User['token'],
    currentUsername: Express.User['username'],
    referralId: Referral['id'],
  ): Promise<Array<ReferralStatusHistoryPresenter>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(currentUsername)
    const referralClient = this.referralClientBuilder(systemToken)

    const referralStatusHistory = await referralClient.findReferralStatusHistory(referralId)

    const usernamesWithoutDuplicates: Array<User['username']> = [
      ...new Set(referralStatusHistory.map(status => status.username as string).filter(username => username)),
    ]

    const usernamesWithFullNames = await Promise.all(
      usernamesWithoutDuplicates.map(async value => {
        try {
          return { [value]: await this.userService.getFullNameFromUsername(userToken, value) }
        } catch (error) {
          logger.error(`Failed to get full name for username ${value}: ${error}`)
          return { [value]: 'Unknown user' }
        }
      }),
    ).then(usernameWithFullName => Object.assign({}, ...usernameWithFullName))

    return referralStatusHistory.map(status => ({
      ...status,
      byLineText: currentUsername === status.username ? 'You' : usernamesWithFullNames[status.username as string],
    }))
  }

  async getReferralViews(
    username: Express.User['username'],
    organisationId: Organisation['id'],
    query?: {
      audience?: string
      courseName?: string
      page?: string
      sortColumn?: string
      sortDirection?: string
      status?: string
      statusGroup?: ReferralStatusGroup
    },
  ): Promise<Paginated<ReferralView>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findReferralViews(organisationId, query)
  }

  async getStatusTransitions(
    username: Express.User['username'],
    referralId: Referral['id'],
    query?: {
      deselectAndKeepOpen?: boolean
      ptUser?: boolean
    },
  ): Promise<Array<ReferralStatusRefData>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findStatusTransitions(referralId, query)
  }

  async submitReferral(username: Express.User['username'], referralId: Referral['id']): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.submit(referralId)
  }

  async updateReferral(
    username: Express.User['username'],
    referralId: Referral['id'],
    referralUpdate: ReferralUpdate,
  ): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.update(referralId, referralUpdate)
  }

  async updateReferralStatus(
    username: Express.User['username'],
    referralId: Referral['id'],
    referralStatusUpdate: ReferralStatusUpdate,
  ): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.updateStatus(referralId, referralStatusUpdate)
  }
}
