import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../logger'
import config from '../config'
import type { User, UserEmail } from '@manage-users-api'

export default class HmppsManageUsersClient {
  restClient: RestClient

  constructor(private readonly token: Express.User['token']) {
    this.restClient = new RestClient('HMPPS Manage Users Client', config.apis.hmppsManageUsers, logger)
  }

  getCurrentUsername(): Promise<Pick<User, 'username'>> {
    return this.restClient.get({ path: '/users/me' }, this.token) as Promise<Pick<User, 'username'>>
  }

  getEmailFromUsername(username: User['username']): Promise<UserEmail> {
    return this.restClient.get({ path: `/users/${username}/email` }, this.token) as Promise<UserEmail>
  }

  getUserFromUsername(username: User['username']): Promise<User> {
    return this.restClient.get({ path: `/users/${username}` }, this.token) as Promise<User>
  }
}
