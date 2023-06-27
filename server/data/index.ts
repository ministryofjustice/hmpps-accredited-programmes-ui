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
import HmppsAuthClient from './hmppsAuthClient'
import PrisonClient from './prisonClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'

type RestClientBuilder<T> = (token: string) => T

const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient()))
const courseClientBuilder = ((token: string) => new CourseClient(token)) as RestClientBuilder<CourseClient>
const prisonClientBuilder = ((token: string) => new PrisonClient(token)) as RestClientBuilder<PrisonClient>

export { CourseClient, HmppsAuthClient, courseClientBuilder, hmppsAuthClient, prisonClientBuilder }

export type { RestClientBuilder }
