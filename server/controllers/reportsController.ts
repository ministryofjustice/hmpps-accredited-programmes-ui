import type { Request, Response, TypedRequestHandler } from 'express'

import { reportsPaths } from '../paths'
import type { OrganisationService, StatisticsService } from '../services'
import { DateUtils, OrganisationUtils, PathUtils, StatisticsReportUtils, TypeUtils } from '../utils'

export default class ReportsController {
  constructor(
    private readonly organisationsService: OrganisationService,
    private readonly statisticsService: StatisticsService,
  ) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { location, period, region } = req.body

      return res.redirect(
        PathUtils.pathWithQuery(reportsPaths.show({}), StatisticsReportUtils.queryParams(period, location, region)),
      )
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { location, period } = req.query as Record<string, string>

      const apiParams = StatisticsReportUtils.filterValuesToApiParams(period)

      const reportTypes = [
        'REFERRAL_COUNT',
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
        this.organisationsService.getAllOrganisations(req.user.token),
      ])

      const selectedPrison = organisations.find(org => org.prisonId === location)?.prisonName

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
        filterFormAction: reportsPaths.filter({}),
        filterValues: { location, period },
        pageHeading: 'Accredited Programmes data',
        prisonLocationOptions: OrganisationUtils.organisationRadioItems(organisations),
        reportDataBlocks: reports.map(report => StatisticsReportUtils.reportContentDataBlock(report)),
        subHeading,
      })
    }
  }
}
