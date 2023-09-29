import logger from '../../logger'
import type { CaseloadClient, HmppsAuthClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import { StringUtils } from '../utils'
import type { UserDetails } from '@accredited-programmes/users'
import type { Caseload } from '@prison-api'

export default class UserService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly caseloadClientBuilder: RestClientBuilder<CaseloadClient>,
  ) {}

  async getUser(token: Express.User['token']): Promise<UserDetails> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const user = await hmppsAuthClient.getUser(token)
    const caseloads = await this.getCaseloads(token)
    return { ...user, caseloads, displayName: StringUtils.convertToTitleCase(user.name) }
  }

  private async getCaseloads(token: Express.User['token']): Promise<Array<Caseload>> {
    const caseloadClient = this.caseloadClientBuilder(token)

    let cases: Array<Caseload> = []

    try {
      cases = await caseloadClient.allByCurrentUser()
    } catch (error) {
      logger.error(error, "Failed to fetch user's caseloads")
    }

    return cases
  }
}
