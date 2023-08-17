import type { TelemetryClient } from 'applicationinsights'
import { DistributedTracingModes, defaultClient, setup } from 'applicationinsights'

import { buildNumber, packageData } from '../applicationVersion'

function defaultName(): string {
  const { name } = packageData
  return name
}

function version(): string {
  return buildNumber
}

function initialiseAppInsights(): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

function buildAppInsightsClient(name = defaultName()): TelemetryClient | null {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    return defaultClient
  }
  return null
}

export { buildAppInsightsClient, initialiseAppInsights }
