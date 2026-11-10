import createError from 'http-errors'

import type { AuthenticationClient, RestClientBuilder, RestClientBuilderWithoutToken, StatisticsClient } from '../data'
import type { SanitisedError } from '../sanitisedError'
import type { ReportContent } from '@accredited-programmes-api'

export default class StatisticsService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<AuthenticationClient>,
    private readonly statisticsClientBuilder: RestClientBuilder<StatisticsClient>,
  ) {}

  async getReport(
    username: Express.User['username'],
    reportType: ReportContent['reportType'],
    query: {
      startDate: string
      endDate?: string
      locationCodes?: Array<string>
    },
  ): Promise<ReportContent | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getToken(username)
    const statisticsClient = this.statisticsClientBuilder(systemToken)

    try {
      const report = await statisticsClient.findReport(reportType, query)

      return report
    } catch (error) {
      const knownError = error as SanitisedError

      if (knownError.responseStatus === 400) {
        return null
      }

      throw createError(knownError.responseStatus || 500, `Error fetching report data for ${reportType}.`)
    }
  }
}
