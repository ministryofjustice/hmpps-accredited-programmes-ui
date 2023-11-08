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
import HmppsAuthClient from './hmppsAuthClient'
import HmppsManageUsersClient from './hmppsManageUsersClient'
import PrisonApiClient from './prisonApiClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import PrisonerSearchClient from './prisonerSearchClient'
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
const hmppsManageUsersClientBuilder: RestClientBuilder<HmppsManageUsersClient> = (token: Express.User['token']) =>
  new HmppsManageUsersClient(token)
const courseClientBuilder: RestClientBuilder<CourseClient> = (token: Express.User['token']) => new CourseClient(token)
const prisonRegisterApiClientBuilder: RestClientBuilder<PrisonRegisterApiClient> = (token: Express.User['token']) =>
  new PrisonRegisterApiClient(token)
const prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient> = (token: Express.User['token']) =>
  new PrisonerSearchClient(token)
const referralClientBuilder: RestClientBuilder<ReferralClient> = (token: Express.User['token']) =>
  new ReferralClient(token)
const prisonApiClientBuilder: RestClientBuilder<PrisonApiClient> = (token: Express.User['token']) =>
  new PrisonApiClient(token)

export {
  CourseClient,
  HmppsAuthClient,
  HmppsManageUsersClient,
  PrisonApiClient,
  PrisonRegisterApiClient,
  PrisonerSearchClient,
  ReferralClient,
  TokenStore,
  courseClientBuilder,
  createRedisClient,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  prisonApiClientBuilder,
  prisonRegisterApiClientBuilder,
  prisonerSearchClientBuilder,
  referralClientBuilder,
  serviceCheckFactory,
  verifyToken,
}

export type { RedisClient, RestClientBuilder, RestClientBuilderWithoutToken, TokenVerifier }
