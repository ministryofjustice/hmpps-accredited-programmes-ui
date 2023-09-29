import type { HmppsAuthClient, RestClientBuilderWithoutToken } from '../data'
import { StringUtils } from '../utils'
import type { UserDetails } from '@accredited-programmes/users'

export default class UserService {
  constructor(private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>) {}

  async getUser(token: Express.User['token']): Promise<UserDetails> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const user = await hmppsAuthClient.getUser(token)
    return { ...user, displayName: StringUtils.convertToTitleCase(user.name) }
  }
}
