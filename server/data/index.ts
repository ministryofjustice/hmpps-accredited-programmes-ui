/* istanbul ignore file */
/* eslint-disable import/first, import/order */

/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import AppInsightsUtils from '../utils/appInsightsUtils'

AppInsightsUtils.initialiseAppInsights()
AppInsightsUtils.buildClient()

/* eslint-enable import/order */

import CourseClient from './courseClient'
import { serviceCheckFactory } from './healthCheck'
import type { User } from './hmppsAuthClient'
import HmppsAuthClient from './hmppsAuthClient'
import PrisonClient from './prisonClient'
import PrisonerClient from './prisonerClient'
import type { RedisClient } from './redisClient'
import { createRedisClient } from './redisClient'
import ReferralClient from './referralClient'
import TokenStore from './tokenStore'
import type { TokenVerifier } from './tokenVerification'
import verifyToken from './tokenVerification'

type RestClientBuilder<T> = (token: Express.User['token']) => T
type RestClientBuilderWithoutToken<T> = () => T

const hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient> = () =>
  new HmppsAuthClient(new TokenStore(createRedisClient()))
const courseClientBuilder: RestClientBuilder<CourseClient> = (token: Express.User['token']) => new CourseClient(token)
const prisonClientBuilder: RestClientBuilder<PrisonClient> = (token: Express.User['token']) => new PrisonClient(token)
const prisonerClientBuilder: RestClientBuilder<PrisonerClient> = (token: Express.User['token']) =>
  new PrisonerClient(token)
const referralClientBuilder: RestClientBuilder<ReferralClient> = (token: Express.User['token']) =>
  new ReferralClient(token)

export {
  CourseClient,
  HmppsAuthClient,
  PrisonClient,
  PrisonerClient,
  ReferralClient,
  TokenStore,
  courseClientBuilder,
  createRedisClient,
  hmppsAuthClientBuilder,
  prisonClientBuilder,
  prisonerClientBuilder,
  referralClientBuilder,
  serviceCheckFactory,
  verifyToken,
}

export type { RedisClient, RestClientBuilder, RestClientBuilderWithoutToken, TokenVerifier, User }
