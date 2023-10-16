import RestClient from './restClient'
import logger from '../../logger'
import config from '../config'
import type { User } from '@accredited-programmes/users'

export default class HmppsManageUsersClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('HMPPS Manage Users Client', config.apis.hmppsManageUsers, token)
  }

  getCurrentUsername(): Promise<Pick<User, 'username'>> {
    logger.info(`Getting username: calling HMPPS Manage Users`)
    return this.restClient.get({ path: '/users/me' }) as Promise<Pick<User, 'username'>>
  }

  getUserFromUsername(username: User['username']): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Manage Users`)
    return this.restClient.get({ path: `/users/${username}` }) as Promise<User>
  }
}
