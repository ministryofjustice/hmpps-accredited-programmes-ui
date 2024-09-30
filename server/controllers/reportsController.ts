import type { Request, Response, TypedRequestHandler } from 'express'

import type { StatisticsService } from '../services'
import { DateUtils, StatisticsReportUtils, TypeUtils } from '../utils'

export default class ReportsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const now = new Date()
      const startDateOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endDateOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

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
            endDate: DateUtils.isoDateOnly(endDateOfLastMonth),
            startDate: DateUtils.isoDateOnly(startDateOfLastMonth),
          }),
        ),
      )

      res.render('reports/show', {
        pageHeading: 'Accredited Programmes data',
        reportDataBlocks: reports.map(report =>
          StatisticsReportUtils.reportContentDataBlock(report, startDateOfLastMonth),
        ),
      })
    }
  }
}
