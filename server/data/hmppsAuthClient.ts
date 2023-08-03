import superagent from 'superagent'
import { URLSearchParams } from 'url'

import RestClient from './restClient'
import type TokenStore from './tokenStore'
import logger from '../../logger'
import { clientCredentials } from '../authentication'
import config from '../config'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = clientCredentials.generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
  )

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    ...(username && { username }),
  }).toString()

  logger.info(`${grantRequest} HMPPS Auth request for client id '${config.apis.hmppsAuth.systemClientId}''`)

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

interface User {
  name: string
  activeCaseLoadId: string
}

interface UserRole {
  roleCode: string
}

export default class HmppsAuthClient {
  constructor(private readonly tokenStore: TokenStore) {}

  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  getUser(token: string): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(token).get({ path: '/api/user/me' }) as Promise<User>
  }

  getUserRoles(token: string): Promise<string[]> {
    return HmppsAuthClient.restClient(token)
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode))
  }

  async getSystemClientToken(username?: string): Promise<string> {
    const key = username || '%ANONYMOUS%'

    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(username)

    // set TTL slightly less than expiry of token. Async but no need to wait
    await this.tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }
}

export type { User, UserRole }
