import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import type { StatisticsService } from '../services'
import ReportsController from './reportsController'
import { reportContentFactory } from '../testutils/factories'
import { StatisticsReportUtils } from '../utils'

jest.mock('../utils/statisticsReportUtils')

const mockStatisticsReportUtils = StatisticsReportUtils as jest.Mocked<typeof StatisticsReportUtils>

describe('ReportsController', () => {
  const username = 'USERNAME'
  const mockTodaysDate = new Date('2024-02-14')

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const statisticsService = createMock<StatisticsService>({})

  const reportDataBlock = {
    date: 'January 2024',
    testId: 'referral-count',
    title: 'Total referrals submitted',
    value: '123',
  }

  let controller: ReportsController

  beforeEach(() => {
    mockStatisticsReportUtils.reportContentDataBlock.mockReturnValue(reportDataBlock)

    controller = new ReportsController(statisticsService)

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

  describe('show', () => {
    it('should render the reports/show view with the correct data', async () => {
      statisticsService.getReport.mockResolvedValue(reportContentFactory.build())

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const expectedQuery = {
        endDate: '2024-01-31',
        startDate: '2024-01-01',
      }

      const reportTypes = [
        'REFERRAL_COUNT',
        'PROGRAMME_COMPLETE_COUNT',
        'NOT_ELIGIBLE_COUNT',
        'WITHDRAWN_COUNT',
        'DESELECTED_COUNT',
      ]

      expect(statisticsService.getReport).toHaveBeenCalledTimes(reportTypes.length)
      reportTypes.forEach(reportType => {
        expect(statisticsService.getReport).toHaveBeenCalledWith(username, reportType, expectedQuery)
      })

      expect(StatisticsReportUtils.reportContentDataBlock).toHaveBeenCalledTimes(reportTypes.length)
      expect(StatisticsReportUtils.reportContentDataBlock).toHaveBeenCalledWith(
        expect.anything(),
        new Date(expectedQuery.startDate),
      )

      expect(response.render).toHaveBeenCalledWith('reports/show', {
        pageHeading: 'Accredited Programmes data',
        reportDataBlocks: [reportDataBlock, reportDataBlock, reportDataBlock, reportDataBlock, reportDataBlock],
      })
    })
  })
})
