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

  async getCurrentUserWithDetails(userToken: Express.User['token']): Promise<UserDetails> {
    const hmppsManageUsersClient = this.hmppsManageUsersClientBuilder(userToken)
    const { username } = await hmppsManageUsersClient.getCurrentUsername()

    const [user, caseloads] = await Promise.all([
      this.getUserFromUsername(userToken, username),
      this.getCaseloads(userToken),
    ])

    return { ...user, caseloads, displayName: StringUtils.convertToTitleCase(user.name) }
  }

  /*
   * A helper which presents a consistent language string across controllers
   * And which factors in the user may no longer be an entity
   */
  async getFullNameFromUsername(userToken: Express.User['token'], username: User['username']): Promise<string> {
    const user = await this.checkUserExistsFromUsername(userToken, username)
    return user ? StringUtils.convertToTitleCase(user.name) : `User '${username}' not found`
  }

  async getUserFromUsername(userToken: Express.User['token'], username: User['username']): Promise<User> {
    const hmppsManageUsersClient = this.hmppsManageUsersClientBuilder(userToken)

    try {
      return await hmppsManageUsersClient.getUserFromUsername(username)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(knownError.status, `User with username ${username} not found.`)
      }

      throw this.createUserLoadNon404Error(username, knownError)
    }
  }

  /*
   * Rather than return a boolean this function returns a thruthy by way of the User object
   * This likely saves on a subsequent call afterwards to fetch these details.
   */
  private async checkUserExistsFromUsername(
    userToken: Express.User['token'],
    username: User['username'],
  ): Promise<User | null> {
    const hmppsManageUsersClient = this.hmppsManageUsersClientBuilder(userToken)

    try {
      const result = await hmppsManageUsersClient.getUserFromUsername(username)
      return result
    } catch (error) {
      const knownError = error as ResponseError
      if (knownError.status === 404) {
        return null
      }
      throw this.createUserLoadNon404Error(username, knownError)
    }
  }

  private createUserLoadNon404Error(username: string, knownError: ResponseError) {
    const errorMessage =
      knownError.message === 'Internal Server Error' ? `Error fetching user ${username}.` : knownError.message
    return createError(knownError.status || 500, errorMessage)
  }

  private async getCaseloads(systemToken: SystemToken): Promise<Array<Caseload>> {
    const prisonApiClient = this.prisonApiClientBuilder(systemToken)

    let cases: Array<Caseload> = []

    try {
      cases = await prisonApiClient.findCurrentUserCaseloads()
    } catch (error) {
      logger.error(error, "Failed to fetch user's caseloads")
    }

    return cases
  }
}
