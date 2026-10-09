import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import logger from '../../logger'
import type { HmppsManageUsersClient, PrisonApiClient, RestClientBuilder } from '../data'
import { StringUtils } from '../utils'
import AppInsightsUtils from '../utils/appInsightsUtils'
import type { UserDetails } from '@accredited-programmes/users'
import type { SystemToken } from '@hmpps-auth'
import type { User, UserEmail } from '@manage-users-api'
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

  async getEmailFromUsername(
    userToken: Express.User['token'],
    username: User['username'],
  ): Promise<UserEmail['email']> {
    const hmppsManageUsersClient = this.hmppsManageUsersClientBuilder(userToken)

    try {
      const userEmail = await hmppsManageUsersClient.getEmailFromUsername(username)

      return userEmail.email
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(knownError.status, { message: `User with username ${username} not found.` })
      }

      const errorMessage =
        knownError.message === 'Internal Server Error' ? `Error fetching email for ${username}.` : knownError.message

      throw createError(knownError.status || 500, errorMessage)
    }
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

    try {
      return await prisonApiClient.findCurrentUserCaseloads()
    } catch (error) {
      // NOTE: Previously this error was swallowed and an empty array of caseloads was returned instead.
      // This meant a transient failure fetching caseloads (e.g. a Prison API/NOMIS blip) silently resulted
      // in `activeCaseLoadId` being `undefined`, which in turn caused course/referral lookups scoped to the
      // user's organisation to come back empty, surfacing as a misleading "No courses found" 404 rather than
      // the real underlying error. Worse, because the user object is cached in the session for the lifetime
      // of the session (see populateCurrentUser), the user would be stuck seeing this 404 on every subsequent
      // We now let the error propagate so it surfaces correctly (as a
      // 500) and is not cached against the session.
      logger.error(error, "Failed to fetch user's caseloads")
      // Emit a distinct, queryable App Insights marker so sustained upstream outages are easy to spot/alert on.
      // We only reach here once the underlying RestClient (superagent) has already exhausted its retries, so
      // each event represents a fully-failed fetch rather than a single transient attempt.
      AppInsightsUtils.trackEvent('CaseloadFetchFailed', { errorMessage: (error as Error).message })
      throw error
    }
  }
}
