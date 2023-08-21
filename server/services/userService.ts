import type { HmppsAuthClient, RestClientBuilderWithoutToken } from '../data'
import { StringUtils } from '../utils'

interface UserDetails {
  displayName: string
  name: string
  userId: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>) {}

  async getUser(token: string): Promise<UserDetails> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const user = await hmppsAuthClient.getUser(token)
    return { ...user, displayName: StringUtils.convertToTitleCase(user.name) }
  }
}
