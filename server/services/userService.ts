import type { HmppsAuthClient, RestClientBuilderWithoutToken } from '../data'
import { stringUtils } from '../utils'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>) {}

  async getUser(token: string): Promise<UserDetails> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const user = await hmppsAuthClient.getUser(token)
    return { ...user, displayName: stringUtils.convertToTitleCase(user.name) }
  }
}
