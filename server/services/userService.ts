import type { HmppsAuthClient, RestClientBuilderWithoutToken } from '../data'
import { StringUtils } from '../utils'

interface UserDetails {
  displayName: string
  name: string
  userId: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>) {}

  async getUser(token: Express.User['token']): Promise<UserDetails> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const user = await hmppsAuthClient.getUser(token)
    return { ...user, displayName: StringUtils.convertToTitleCase(user.name) }
  }

  async getUserRoles(token: Express.User['token']): Promise<Array<string>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const userRoles = await hmppsAuthClient.getUserRoles(token)
    return userRoles
  }
}
