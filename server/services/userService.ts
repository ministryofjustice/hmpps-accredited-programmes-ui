import type { HmppsAuthClient } from '../data'
import { stringUtils } from '../utils'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    return { ...user, displayName: stringUtils.convertToTitleCase(user.name) }
  }
}
