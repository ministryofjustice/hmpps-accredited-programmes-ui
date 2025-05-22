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
import OrganisationClient from './accreditedProgrammesApi/organisationClient'
import PersonClient from './accreditedProgrammesApi/personClient'
import PniClient from './accreditedProgrammesApi/pniClient'
import ReferenceDataClient from './accreditedProgrammesApi/referenceDataClient'
import ReferralClient from './accreditedProgrammesApi/referralClient'
import StatisticsClient from './accreditedProgrammesApi/statisticsClient'
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

const tokenStore = new TokenStore(createRedisClient())

const hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient> = () => new HmppsAuthClient(tokenStore)
const hmppsManageUsersClientBuilder: RestClientBuilder<HmppsManageUsersClient> = (userToken: Express.User['token']) =>
  new HmppsManageUsersClient(userToken)
const courseClientBuilder: RestClientBuilder<CourseClient> = (userToken: Express.User['token']) =>
  new CourseClient(userToken)
const oasysClientBuilder: RestClientBuilder<OasysClient> = (systemToken: SystemToken) => new OasysClient(systemToken)
const organisationClientBuilder: RestClientBuilder<OrganisationClient> = (systemToken: SystemToken) =>
  new OrganisationClient(systemToken)
const personClientBuilder: RestClientBuilder<PersonClient> = (systemToken: SystemToken) => new PersonClient(systemToken)
const pniClientBuilder: RestClientBuilder<PniClient> = (systemToken: SystemToken) => new PniClient(systemToken)
const prisonRegisterApiClientBuilder: RestClientBuilder<PrisonRegisterApiClient> = (userToken: Express.User['token']) =>
  new PrisonRegisterApiClient(userToken)
const referenceDataClientBuilder: RestClientBuilder<ReferenceDataClient> = (systemToken: SystemToken) =>
  new ReferenceDataClient(systemToken)
const referralClientBuilder: RestClientBuilder<ReferralClient> = (userToken: Express.User['token']) =>
  new ReferralClient(userToken)
const statisticsClientBuilder: RestClientBuilder<StatisticsClient> = (systemToken: SystemToken) =>
  new StatisticsClient(systemToken)
const prisonApiClientBuilder: RestClientBuilder<PrisonApiClient> = (systemToken: SystemToken) =>
  new PrisonApiClient(systemToken)

export {
  CourseClient,
  HmppsAuthClient,
  HmppsManageUsersClient,
  OasysClient,
  OrganisationClient,
  PersonClient,
  PniClient,
  PrisonApiClient,
  PrisonRegisterApiClient,
  ReferenceDataClient,
  ReferralClient,
  StatisticsClient,
  TokenStore,
  courseClientBuilder,
  createRedisClient,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  oasysClientBuilder,
  organisationClientBuilder,
  personClientBuilder,
  pniClientBuilder,
  prisonApiClientBuilder,
  prisonRegisterApiClientBuilder,
  referenceDataClientBuilder,
  referralClientBuilder,
  serviceCheckFactory,
  statisticsClientBuilder,
  verifyToken,
}

export type { RedisClient, RestClientBuilder, RestClientBuilderWithoutToken, TokenVerifier }
