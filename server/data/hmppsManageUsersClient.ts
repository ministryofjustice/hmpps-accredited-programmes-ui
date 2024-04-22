import RestClient from './restClient'
import config from '../config'
import type { User, UserEmail } from '@manage-users-api'

export default class HmppsManageUsersClient {
  restClient: RestClient

  constructor(userToken: Express.User['token']) {
    this.restClient = new RestClient('HMPPS Manage Users Client', config.apis.hmppsManageUsers, userToken)
  }

  getCurrentUsername(): Promise<Pick<User, 'username'>> {
    return this.restClient.get({ path: '/users/me' }) as Promise<Pick<User, 'username'>>
  }

  getEmailFromUsername(username: User['username']): Promise<UserEmail> {
    return this.restClient.get({ path: `/users/${username}/email` }) as Promise<UserEmail>
  }

  getUserFromUsername(username: User['username']): Promise<User> {
    return this.restClient.get({ path: `/users/${username}` }) as Promise<User>
  }
}
