import { HmppsAuthClient } from '../data'
import { stringUtils } from '../utils'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  hmppsAuthClient: HmppsAuthClient

  constructor(token: string) {
    this.hmppsAuthClient = new HmppsAuthClient(token)
  }

  async getUser(): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser()
    return { ...user, displayName: stringUtils.convertToTitleCase(user.name) }
  }
}
