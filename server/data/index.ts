/* istanbul ignore file */

import { AuthenticationClient, RedisTokenStore, VerificationClient } from '@ministryofjustice/hmpps-auth-clients'

import logger from '../../logger'
import config from '../config'
import CourseClient from './accreditedProgrammesApi/courseClient'
import OasysClient from './accreditedProgrammesApi/oasysClient'
import OrganisationClient from './accreditedProgrammesApi/organisationClient'
import PersonClient from './accreditedProgrammesApi/personClient'
import PniClient from './accreditedProgrammesApi/pniClient'
import ReferenceDataClient from './accreditedProgrammesApi/referenceDataClient'
import ReferralClient from './accreditedProgrammesApi/referralClient'
import StatisticsClient from './accreditedProgrammesApi/statisticsClient'
import HmppsManageUsersClient from './hmppsManageUsersClient'
import PrisonApiClient from './prisonApiClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import { createRedisClient } from './redisClient'
import type { SystemToken } from '@hmpps-auth'

type RestClientBuilder<T> = (token: Express.User['token'] | SystemToken) => T
type RestClientBuilderWithoutToken<T> = () => T

const hmppsAuthClient = new AuthenticationClient(
  config.apis.hmppsAuth,
  logger,
  new RedisTokenStore(createRedisClient()),
)
const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)

const hmppsAuthClientBuilder: RestClientBuilderWithoutToken<AuthenticationClient> = () => hmppsAuthClient
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
  AuthenticationClient,
  CourseClient,
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
  statisticsClientBuilder,
  tokenVerificationClient,
}

export type { RestClientBuilder, RestClientBuilderWithoutToken }
