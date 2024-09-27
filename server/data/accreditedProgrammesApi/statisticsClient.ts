/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { ReportContent } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class StatisticsClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('statistics', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async findReport(
    reportType: ReportContent['reportType'],
    query: {
      startDate: string
      endDate?: string
    },
  ): Promise<ReportContent> {
    return (await this.restClient.get({
      path: apiPaths.statistics.report({ reportType }),
      query: {
        startDate: query.startDate,
        ...(query.endDate && { endDate: query.endDate }),
      },
    })) as ReportContent
  }
}
