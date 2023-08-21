import type { Request } from 'express'
import superagent from 'superagent'

import logger from '../../logger'
import config from '../config'
import sanitiseError from '../sanitisedError'
import { TypeUtils } from '../utils'

function getApiClientToken(token: Express.User['token']) {
  return superagent
    .post(`${config.apis.tokenVerification.url}/token/verify`)
    .auth(token, { type: 'bearer' })
    .timeout(config.apis.tokenVerification.timeout)
    .then(response => Boolean(response.body && response.body.active))
    .catch(error => {
      logger.error(sanitiseError(error), 'Error calling tokenVerificationApi')
    })
}

type TokenVerifier = (request: Request) => Promise<boolean | void>

const verifyToken: TokenVerifier = async request => {
  TypeUtils.assertHasUser(request)
  const { user, verified } = request

  if (!config.apis.tokenVerification.enabled) {
    logger.debug('Token verification disabled, returning token is valid')
    return true
  }

  if (verified) {
    return true
  }

  logger.debug(`token request for user "${user.username}'`)

  const result = await getApiClientToken(user.token)
  if (result) {
    request.verified = true
  }
  return result
}

export default verifyToken

export type { TokenVerifier }
