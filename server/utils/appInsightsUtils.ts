import type { TelemetryClient } from 'applicationinsights'
import { Contracts, DistributedTracingModes, defaultClient, setup } from 'applicationinsights'
import type { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'

import { buildNumber, packageData } from '../applicationVersion'
import type { User } from '../data'

type ContextObjectWithUser = {
  res?: {
    locals?: {
      user: Partial<User>
    }
  }
}

export type ContextObjects = Record<string, ContextObjectWithUser> | undefined

export default class AppInsightsUtils {
  static addUserDataToRequests = (envelope: EnvelopeTelemetry, contextObjects: ContextObjects): boolean => {
    const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
    const { username, activeCaseLoadId } = contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
    if (isRequest && username && envelope.data.baseData) {
      const { properties } = envelope.data.baseData
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        activeCaseLoadId,
        username,
        ...properties,
      }
    }
    return true
  }

  static buildClient = (name = AppInsightsUtils.defaultName()): TelemetryClient | null => {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      defaultClient.context.tags['ai.cloud.role'] = name
      defaultClient.context.tags['ai.application.ver'] = this.version()
      defaultClient.addTelemetryProcessor(AppInsightsUtils.addUserDataToRequests)
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
