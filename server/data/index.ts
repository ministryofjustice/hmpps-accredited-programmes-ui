/* istanbul ignore file */
/* eslint-disable import/first, import/order */

/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import type { SystemToken } from '@hmpps-auth'
import AppInsightsUtils from '../utils/appInsightsUtils'

AppInsightsUtils.initialiseAppInsights()
AppInsightsUtils.buildClient()

/* eslint-enable import/order */

import CourseClient from './accreditedProgrammesApi/courseClient'
import OasysClient from './accreditedProgrammesApi/oasysClient'
import PrisonerSearchClient from './accreditedProgrammesApi/prisonerSearchClient'
import ReferenceDataClient from './accreditedProgrammesApi/referenceDataClient'
import ReferralClient from './accreditedProgrammesApi/referralClient'
import { serviceCheckFactory } from './healthCheck'
import HmppsAuthClient from './hmppsAuthClient'
import HmppsManageUsersClient from './hmppsManageUsersClient'
import PrisonApiClient from './prisonApiClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import type { RedisClient } from './redisClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import type { TokenVerifier } from './tokenVerification'
import verifyToken from './tokenVerification'

type RestClientBuilder<T> = (token: Express.User['token'] | SystemToken) => T
type RestClientBuilderWithoutToken<T> = () => T

const hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient> = () =>
  new HmppsAuthClient(new TokenStore(createRedisClient()))
const hmppsManageUsersClientBuilder: RestClientBuilder<HmppsManageUsersClient> = (userToken: Express.User['token']) =>
  new HmppsManageUsersClient(userToken)
const courseClientBuilder: RestClientBuilder<CourseClient> = (userToken: Express.User['token']) =>
  new CourseClient(userToken)
const oasysClientBuilder: RestClientBuilder<OasysClient> = (systemToken: SystemToken) => new OasysClient(systemToken)
const prisonRegisterApiClientBuilder: RestClientBuilder<PrisonRegisterApiClient> = (userToken: Express.User['token']) =>
  new PrisonRegisterApiClient(userToken)
const prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient> = (systemToken: SystemToken) =>
  new PrisonerSearchClient(systemToken)
const referenceDataClientBuilder: RestClientBuilder<ReferenceDataClient> = (systemToken: SystemToken) =>
  new ReferenceDataClient(systemToken)
const referralClientBuilder: RestClientBuilder<ReferralClient> = (userToken: Express.User['token']) =>
  new ReferralClient(userToken)
const prisonApiClientBuilder: RestClientBuilder<PrisonApiClient> = (systemToken: SystemToken) =>
  new PrisonApiClient(systemToken)

export {
  CourseClient,
  HmppsAuthClient,
  HmppsManageUsersClient,
  OasysClient,
  PrisonApiClient,
  PrisonRegisterApiClient,
  PrisonerSearchClient,
  ReferenceDataClient,
  ReferralClient,
  TokenStore,
  courseClientBuilder,
  createRedisClient,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  oasysClientBuilder,
  prisonApiClientBuilder,
  prisonRegisterApiClientBuilder,
  prisonerSearchClientBuilder,
  referenceDataClientBuilder,
  referralClientBuilder,
  serviceCheckFactory,
  verifyToken,
}

export type { RedisClient, RestClientBuilder, RestClientBuilderWithoutToken, TokenVerifier }
