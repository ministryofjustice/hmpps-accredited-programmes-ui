import type { Request, Response, TypedRequestHandler } from 'express'

import { reportsPaths } from '../paths'
import type { ReferenceDataService, StatisticsService } from '../services'
import { DateUtils, OrganisationUtils, PathUtils, StatisticsReportUtils, TypeUtils } from '../utils'

export default class ReportsController {
  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly statisticsService: StatisticsService,
  ) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { dateFrom, dateTo, location, period, region } = req.body

      return res.redirect(
        PathUtils.pathWithQuery(
          reportsPaths.show({}),
          StatisticsReportUtils.queryParams(period, location, region, dateFrom, dateTo),
        ),
      )
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { dateFrom, dateTo, location, period: periodQuery, region } = req.query as Record<string, string>

      let period = periodQuery

      const errorMessages = StatisticsReportUtils.validateFilterValues(period, dateFrom, dateTo, region, location)

      if (Object.keys(errorMessages).length) {
        period = 'lastMonth'
      }

      const apiParams = StatisticsReportUtils.filterValuesToApiParams(period, dateFrom, dateTo)

      const reportTypes = [
        'REFERRAL_COUNT',
        'ON_PROGRAMME_COUNT',
        'PROGRAMME_COMPLETE_COUNT',
        'NOT_ELIGIBLE_COUNT',
        'WITHDRAWN_COUNT',
        'DESELECTED_COUNT',
      ]

      const [reports, organisations] = await Promise.all([
        Promise.all(
          reportTypes.map(reportType =>
            this.statisticsService.getReport(req.user.username, reportType, {
              endDate: apiParams.endDate,
              locationCodes: location ? [location] : undefined,
              startDate: apiParams.startDate,
            }),
          ),
        ),
        this.referenceDataService.getEnabledOrganisations(req.user.token),
      ])

      const selectedPrison = organisations.find(org => org.code === location)?.description

      const subHeading = [
        'Showing data',
        selectedPrison ? `for ${selectedPrison}` : '',
        'from',
        DateUtils.govukFormattedFullDateString(apiParams.startDate),
        'to',
        DateUtils.govukFormattedFullDateString(apiParams.endDate),
      ]
        .filter(Boolean)
        .join(' ')

      res.render('reports/show', {
        errorMessages,
        filterFormAction: reportsPaths.filter({}),
        filterValues: { dateFrom, dateTo, location, period: periodQuery, region },
        pageHeading: 'Accredited Programmes data',
        prisonLocationOptions: OrganisationUtils.organisationRadioItems(organisations),
        reportDataBlocks: reports.map(report => StatisticsReportUtils.reportContentDataBlock(report)),
        subHeading,
      })
    }
  }
}
