/* istanbul ignore file */
import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../../logger'
import config from '../../config'
import { apiPaths } from '../../paths'
import type { ReportContent } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class StatisticsClient {
  restClient: RestClient

  constructor(private readonly token: SystemToken) {
    this.restClient = new RestClient('statistics', config.apis.accreditedProgrammesApi, logger)
  }

  async findReport(
    reportType: ReportContent['reportType'],
    query: {
      startDate: string
      endDate?: string
      locationCodes?: Array<string>
    },
  ): Promise<ReportContent> {
    return (await this.restClient.get(
      {
        path: apiPaths.statistics.report({ reportType }),
        query: {
          startDate: query.startDate,
          ...(query.endDate && { endDate: query.endDate }),
          ...(query.locationCodes && { locationCodes: query.locationCodes.join(',') }),
        },
      },
      this.token,
    )) as ReportContent
  }
}
