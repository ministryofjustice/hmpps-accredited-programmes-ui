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
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'

type RestClientBuilder<T> = (token: string) => T

const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  courseClientBuilder: ((token: string) => new CourseClient(token)) as RestClientBuilder<CourseClient>,
})

type DataAccess = ReturnType<typeof dataAccess>

export { CourseClient, HmppsAuthClient, RestClientBuilder, dataAccess }

export type { DataAccess }
