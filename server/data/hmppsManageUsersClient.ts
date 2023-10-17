import RestClient from './restClient'
import config from '../config'
import type { User } from '@manage-users-api'

export default class HmppsManageUsersClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('HMPPS Manage Users Client', config.apis.hmppsManageUsers, token)
  }

  getCurrentUsername(): Promise<Pick<User, 'username'>> {
    return this.restClient.get({ path: '/users/me' }) as Promise<Pick<User, 'username'>>
  }

  getUserFromUsername(username: User['username']): Promise<User> {
    return this.restClient.get({ path: `/users/${username}` }) as Promise<User>
  }
}
