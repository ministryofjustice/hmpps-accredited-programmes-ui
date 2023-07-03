/* eslint-disable import/first, import/order */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

/* eslint-enable import/order */

import CourseClient from './courseClient'
import { serviceCheckFactory } from './healthCheck'
import type { User } from './hmppsAuthClient'
import HmppsAuthClient from './hmppsAuthClient'
import PrisonClient from './prisonClient'
import type { RedisClient } from './redisClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import type { TokenVerifier } from './tokenVerification'
import verifyToken from './tokenVerification'

type RestClientBuilder<T> = (token: string) => T

export { CourseClient, HmppsAuthClient, PrisonClient, TokenStore, createRedisClient, serviceCheckFactory, verifyToken }

export type { RedisClient, RestClientBuilder, TokenVerifier, User }
