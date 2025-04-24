import type CourseService from './courseService'
import type PniService from './pniService'
import type UserService from './userService'
import logger from '../../logger'
import type { HmppsAuthClient, ReferralClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  ConfirmationFields,
  Organisation,
  Paginated,
  ReferralStatusGroup,
  ReferralStatusRefData,
  ReferralStatusUpdate,
  ReferralStatusUppercase,
  ReferralView,
} from '@accredited-programmes/models'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { Course, PniScore, Referral, ReferralUpdate, TransferReferralRequest } from '@accredited-programmes-api'
import type { User } from '@manage-users-api'

export default class ReferralService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly referralClientBuilder: RestClientBuilder<ReferralClient>,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
    private readonly pniService: PniService,
  ) {}

  async createReferral(
    username: Express.User['username'],
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Referral> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.create(courseOfferingId, prisonNumber)
  }

  async deleteReferral(username: Express.User['username'], referralId: Referral['id']): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.deleteReferral(referralId)
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

  async getDuplicateReferrals(
    username: Express.User['username'],
    offeringId: string,
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Array<Referral>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findDuplicateReferrals(offeringId, prisonNumber)
  }

  async getMyReferralViews(
    username: Express.User['username'],
    query?: {
      nameOrId?: string
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

  async getPathways(
    username: Express.User['username'],
    referralId: Referral['id'],
  ): Promise<{
    recommended?: PniScore['programmePathway']
    requested?: Course['intensity']
  }> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    const referral = await referralClient.find(referralId)
    const [pniScore, course] = await Promise.all([
      this.pniService.getPni(username, referral.prisonNumber),
      this.courseService.getCourseByOffering(username, referral.offeringId),
    ])

    return {
      recommended: pniScore?.programmePathway,
      requested: course.intensity,
    }
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
      hasLdcString?: string
      nameOrId?: string
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

  async transferReferralToBuildingChoices(
    username: Express.User['username'],
    transferRequest: TransferReferralRequest,
  ): Promise<Referral> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.transferToBuildingChoices(transferRequest)
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
