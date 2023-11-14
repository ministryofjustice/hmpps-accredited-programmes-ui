import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import logger from '../../logger'
import type { HmppsManageUsersClient, PrisonApiClient, RestClientBuilder } from '../data'
import { StringUtils } from '../utils'
import type { UserDetails } from '@accredited-programmes/users'
import type { SystemToken } from '@hmpps-auth'
import type { User } from '@manage-users-api'
import type { Caseload } from '@prison-api'

export default class UserService {
  constructor(
    private readonly hmppsManageUsersClientBuilder: RestClientBuilder<HmppsManageUsersClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
  ) {}

  async getCurrentUserWithDetails(token: Express.User['token']): Promise<UserDetails> {
    const hmppsManageUsersClient = this.hmppsManageUsersClientBuilder(token)
    const { username } = await hmppsManageUsersClient.getCurrentUsername()

    const [user, caseloads] = await Promise.all([this.getUserFromUsername(token, username), this.getCaseloads(token)])

    return { ...user, caseloads, displayName: StringUtils.convertToTitleCase(user.name) }
  }

  async getUserFromUsername(token: Express.User['token'], username: User['username']): Promise<User> {
    const hmppsManageUsersClient = this.hmppsManageUsersClientBuilder(token)

    try {
      return await hmppsManageUsersClient.getUserFromUsername(username)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(knownError.status, `User with username ${username} not found.`)
      }

      const errorMessage =
        knownError.message === 'Internal Server Error' ? `Error fetching user ${username}.` : knownError.message

      throw createError(knownError.status || 500, errorMessage)
    }
  }

  private async getCaseloads(token: SystemToken): Promise<Array<Caseload>> {
    const prisonApiClient = this.prisonApiClientBuilder(token)

    let cases: Array<Caseload> = []

    try {
      cases = await prisonApiClient.findCurrentUserCaseloads()
    } catch (error) {
      logger.error(error, "Failed to fetch user's caseloads")
    }

    return cases
  }
}
