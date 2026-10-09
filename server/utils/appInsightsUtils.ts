/* istanbul ignore file */

import type { TelemetryClient } from 'applicationinsights'
import { Contracts, DistributedTracingModes, defaultClient, setup } from 'applicationinsights'
import type { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'

import { buildNumber, packageData } from '../applicationVersion'
import type { UserDetails } from '@accredited-programmes/users'

type ContextObjectWithUser = {
  res?: {
    locals?: {
      user: Partial<UserDetails> & {
        roles: Array<string>
      }
    }
  }
}

export type ContextObjects = Record<string, ContextObjectWithUser> | undefined

export default class AppInsightsUtils {
  static addUserDataToRequests = (envelope: EnvelopeTelemetry, contextObjects: ContextObjects): boolean => {
    const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
    const { username, activeCaseLoadId, caseloads, roles } =
      contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
    if (isRequest && username && envelope.data.baseData) {
      const { properties } = envelope.data.baseData
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        acpRoles: roles?.filter(role => role.startsWith('ROLE_ACP_')),
        activeCaseLoadDescription: caseloads?.find(caseload => caseload.caseLoadId === activeCaseLoadId)?.description,
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

  /**
   * Emits a custom event to App Insights (a no-op when App Insights is not configured, e.g. locally/in tests).
   * Prefer this over relying on a parsed log message when you want a stable, queryable signal to build
   * dashboards/alerts on - e.g. spotting sustained upstream outages.
   */
  static trackEvent = (name: string, properties?: Record<string, string>): void => {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      defaultClient?.trackEvent({ name, properties })
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
