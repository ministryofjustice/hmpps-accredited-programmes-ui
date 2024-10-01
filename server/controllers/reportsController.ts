import type { Request, Response, TypedRequestHandler } from 'express'

import { reportsPaths } from '../paths'
import type { StatisticsService } from '../services'
import { DateUtils, PathUtils, StatisticsReportUtils, TypeUtils } from '../utils'

export default class ReportsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { period, location } = req.body

      return res.redirect(
        PathUtils.pathWithQuery(reportsPaths.show({}), StatisticsReportUtils.queryParams(period, location)),
      )
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { period } = req.query as Record<string, string>

      const apiParams = StatisticsReportUtils.filterValuesToApiParams(period)

      const reportTypes = [
        'REFERRAL_COUNT',
        'PROGRAMME_COMPLETE_COUNT',
        'NOT_ELIGIBLE_COUNT',
        'WITHDRAWN_COUNT',
        'DESELECTED_COUNT',
      ]

      const reports = await Promise.all(
        reportTypes.map(reportType =>
          this.statisticsService.getReport(req.user.username, reportType, {
            endDate: apiParams.endDate,
            startDate: apiParams.startDate,
          }),
        ),
      )

      res.render('reports/show', {
        filterFormAction: reportsPaths.filter({}),
        filterValues: { period },
        pageHeading: 'Accredited Programmes data',
        reportDataBlocks: reports.map(report => StatisticsReportUtils.reportContentDataBlock(report)),
        subHeading: `Showing data for ${DateUtils.govukFormattedFullDateString(apiParams.startDate)} to ${DateUtils.govukFormattedFullDateString(apiParams.endDate)}`,
      })
    }
  }
}
