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
type RestClientBuilderWithoutToken<T> = () => T

const hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient> = () =>
  new HmppsAuthClient(new TokenStore(createRedisClient()))
const courseClientBuilder: RestClientBuilder<CourseClient> = (token: string) => new CourseClient(token)
const prisonClientBuilder: RestClientBuilder<PrisonClient> = (token: string) => new PrisonClient(token)

export { CourseClient, HmppsAuthClient, courseClientBuilder, hmppsAuthClientBuilder, prisonClientBuilder }

export type { RestClientBuilder, RestClientBuilderWithoutToken }
