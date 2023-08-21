import type { TelemetryClient } from 'applicationinsights'
import { DistributedTracingModes, defaultClient, setup } from 'applicationinsights'

import { buildNumber, packageData } from '../applicationVersion'

const defaultName = (): string => {
  const { name } = packageData
  return name
}

const version = (): string => {
  return buildNumber
}

const initialiseAppInsights = (): void => {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

const buildAppInsightsClient = (name = defaultName()): TelemetryClient | null => {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    return defaultClient
  }
  return null
}

export { buildAppInsightsClient, initialiseAppInsights }
