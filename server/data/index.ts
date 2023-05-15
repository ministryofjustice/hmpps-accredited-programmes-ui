/* eslint-disable import/first, import/order */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

/* eslint-enable import/order */

import HmppsAuthClient from './hmppsAuthClient'
import ProgrammeClient from './programmeClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  programmeClientBuilder: ((token: string) => new ProgrammeClient(token)) as RestClientBuilder<ProgrammeClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, ProgrammeClient, RestClientBuilder }
