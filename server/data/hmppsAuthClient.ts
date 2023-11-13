import superagent from 'superagent'
import { URLSearchParams } from 'url'

import type TokenStore from './tokenStore'
import logger from '../../logger'
import { ClientCredentials } from '../authentication'
import config from '../config'
import type { SystemToken } from '@hmpps-auth'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = ClientCredentials.generateOauthClientToken(
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

export default class HmppsAuthClient {
  constructor(private readonly tokenStore: TokenStore) {}

  async getSystemClientToken(username?: string): Promise<SystemToken> {
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
