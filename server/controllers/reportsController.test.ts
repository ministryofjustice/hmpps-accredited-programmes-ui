import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import type { OrganisationService, StatisticsService } from '../services'
import ReportsController from './reportsController'
import { prisonFactory, reportContentFactory } from '../testutils/factories'
import { OrganisationUtils, PathUtils, StatisticsReportUtils } from '../utils'

jest.mock('../utils/organisationUtils')
jest.mock('../utils/statisticsReportUtils')
jest.mock('../utils/pathUtils')

const mockOrganisationUtils = OrganisationUtils as jest.Mocked<typeof OrganisationUtils>
const mockStatisticsReportUtils = StatisticsReportUtils as jest.Mocked<typeof StatisticsReportUtils>
const mockPathUtils = PathUtils as jest.Mocked<typeof PathUtils>

describe('ReportsController', () => {
  const username = 'USERNAME'
  const mockTodaysDate = new Date('2024-02-14')
  const lastMonth = {
    endDate: '2024-01-31',
    startDate: '2024-01-01',
  }
  const queryParams = [{ key: 'period', value: 'lastSixMonths' }]
  const pathWithQuery = '/reports?period=lastSixMonths'
  const allOrganisations = [
    prisonFactory.build({ prisonId: 'MDI', prisonName: 'Moorland' }),
    prisonFactory.build({ prisonId: 'LEI', prisonName: 'Leeds' }),
  ]
  const prisonLocationOptions = [
    { text: 'Leeds', value: 'LEI' },
    { text: 'Moorland', value: 'MDI' },
  ]
  const errorMessages = {}

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const organisationsService = createMock<OrganisationService>({})
  const statisticsService = createMock<StatisticsService>({})

  const reportDataBlock = {
    testId: 'referral-count',
    title: 'Total referrals submitted',
    value: '123',
  }

  let controller: ReportsController

  beforeEach(() => {
    mockOrganisationUtils.organisationRadioItems.mockReturnValue(prisonLocationOptions)
    mockStatisticsReportUtils.reportContentDataBlock.mockReturnValue(reportDataBlock)
    mockStatisticsReportUtils.filterValuesToApiParams.mockReturnValue(lastMonth)
    mockStatisticsReportUtils.queryParams.mockReturnValue(queryParams)
    mockStatisticsReportUtils.validateFilterValues.mockReturnValue(errorMessages)
    mockPathUtils.pathWithQuery.mockReturnValue(pathWithQuery)

    organisationsService.getAllOrganisations.mockResolvedValue(allOrganisations)

    controller = new ReportsController(organisationsService, statisticsService)

    request = createMock<Request>({
      user: { username },
    })
    response = createMock<Response>()

    jest.useFakeTimers().setSystemTime(mockTodaysDate)
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  describe('filter', () => {
    it('should redirect to the reports show page with the correct query params', async () => {
      request.body = { dateFrom: '1/2/2023', dateTo: '1/3/2023', location: 'MDI', period: 'custom', region: 'prison' }

      const requestHandler = controller.filter()
      await requestHandler(request, response, next)

      expect(StatisticsReportUtils.queryParams).toHaveBeenCalledWith('custom', 'MDI', 'prison', '1/2/2023', '1/3/2023')
      expect(PathUtils.pathWithQuery).toHaveBeenCalledWith('/reports', queryParams)
      expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
    })
  })

  describe('show', () => {
    const reportContent = reportContentFactory.build()
    const reportTypes = [
      'REFERRAL_COUNT',
      'PROGRAMME_COMPLETE_COUNT',
      'NOT_ELIGIBLE_COUNT',
      'WITHDRAWN_COUNT',
      'DESELECTED_COUNT',
    ]

    beforeEach(() => {
      statisticsService.getReport.mockResolvedValue(reportContent)
    })

    it('should render the reports/show view with the correct data', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(statisticsService.getReport).toHaveBeenCalledTimes(reportTypes.length)
      reportTypes.forEach(reportType => {
        expect(statisticsService.getReport).toHaveBeenCalledWith(username, reportType, lastMonth)
      })

      expect(StatisticsReportUtils.filterValuesToApiParams).toHaveBeenCalledTimes(1)
      expect(StatisticsReportUtils.filterValuesToApiParams).toHaveBeenCalledWith(undefined, undefined, undefined)
      expect(StatisticsReportUtils.reportContentDataBlock).toHaveBeenCalledTimes(reportTypes.length)
      expect(StatisticsReportUtils.reportContentDataBlock).toHaveBeenCalledWith(reportContent)
      expect(StatisticsReportUtils.validateFilterValues).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      )

      expect(response.render).toHaveBeenCalledWith('reports/show', {
        errorMessages,
        filterFormAction: '/reports',
        filterValues: {},
        pageHeading: 'Accredited Programmes data',
        prisonLocationOptions,
        reportDataBlocks: Array(reportTypes.length).fill(reportDataBlock),
        subHeading: 'Showing data from 1 January 2024 to 31 January 2024',
      })
    })

    describe('with query params', () => {
      it('should render the reports/show view with the correct data', async () => {
        request.query = { location: 'MDI', period: 'lastSixMonths' }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(statisticsService.getReport).toHaveBeenCalledTimes(reportTypes.length)
        reportTypes.forEach(reportType => {
          expect(statisticsService.getReport).toHaveBeenCalledWith(username, reportType, {
            ...lastMonth,
            locationCodes: ['MDI'],
          })
        })

        expect(StatisticsReportUtils.filterValuesToApiParams).toHaveBeenCalledTimes(1)
        expect(StatisticsReportUtils.filterValuesToApiParams).toHaveBeenCalledWith(
          'lastSixMonths',
          undefined,
          undefined,
        )
        expect(StatisticsReportUtils.reportContentDataBlock).toHaveBeenCalledTimes(reportTypes.length)
        expect(StatisticsReportUtils.reportContentDataBlock).toHaveBeenCalledWith(reportContent)

        expect(response.render).toHaveBeenCalledWith('reports/show', {
          errorMessages,
          filterFormAction: '/reports',
          filterValues: { location: 'MDI', period: 'lastSixMonths' },
          pageHeading: 'Accredited Programmes data',
          prisonLocationOptions,
          reportDataBlocks: Array(reportTypes.length).fill(reportDataBlock),
          subHeading: 'Showing data for Moorland from 1 January 2024 to 31 January 2024',
        })
      })
    })

    describe('when there are `errorMessages`', () => {
      it('defaults to `lastMonth` period but maintains the filter values', async () => {
        request.query = { dateTo: '2/10/2024', location: 'MDI', period: 'custom' }

        mockStatisticsReportUtils.validateFilterValues.mockReturnValue({
          dateFrom: { text: 'Please enter a valid date' },
        })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(StatisticsReportUtils.filterValuesToApiParams).toHaveBeenCalledWith('lastMonth', undefined, '2/10/2024')
        expect(response.render).toHaveBeenCalledWith(
          'reports/show',
          expect.objectContaining({
            errorMessages: { dateFrom: { text: 'Please enter a valid date' } },
            filterValues: {
              dateTo: '2/10/2024',
              location: 'MDI',
              period: 'custom',
            },
          }),
        )
      })
    })
  })
})
