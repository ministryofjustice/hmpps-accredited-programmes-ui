import type { TelemetryClient } from 'applicationinsights'
import { DistributedTracingModes, defaultClient, setup } from 'applicationinsights'

import { buildNumber, packageData } from '../applicationVersion'

export default class AppInsightsUtils {
  static buildClient = (name = AppInsightsUtils.defaultName()): TelemetryClient | null => {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      defaultClient.context.tags['ai.cloud.role'] = name
      defaultClient.context.tags['ai.application.ver'] = this.version()
      return defaultClient
    }
    return null
  }

  static initialiseAppInsights = (): void => {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      // eslint-disable-next-line no-console
      console.log('Enabling azure application insights')

      setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
    }
  }

  private static defaultName = (): string => {
    const { name } = packageData
    return name
  }

  private static version = (): string => {
    return buildNumber
  }
}
