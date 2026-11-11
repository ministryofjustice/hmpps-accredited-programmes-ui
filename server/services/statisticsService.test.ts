import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { AuthenticationClient } from '../data'
import { StatisticsClient } from '../data'
import StatisticsService from './statisticsService'
import { reportContentFactory } from '../testutils/factories'
import Helpers from '../testutils/helpers'

jest.mock('../data/accreditedProgrammesApi/statisticsClient')

describe('StatisticsService', () => {
  const systemToken = 'SYSTEM_TOKEN'
  const username = 'USERNAME'

  const hmppsAuthClient = createMock<AuthenticationClient>()
  const hmppsAuthClientBuilder = jest.fn()

  const statisticsClient = new StatisticsClient(systemToken) as jest.Mocked<StatisticsClient>
  const statisticsClientBuilder = jest.fn()

  const service = new StatisticsService(hmppsAuthClientBuilder, statisticsClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    statisticsClientBuilder.mockReturnValue(statisticsClient)
    hmppsAuthClient.getToken.mockResolvedValue(systemToken)
  })

  describe('getReport', () => {
    const reportContent = reportContentFactory.build()

    beforeEach(() => {
      statisticsClient.findReport.mockResolvedValue(reportContent)
    })

    it('returns the report content for the given report type', async () => {
      const result = await service.getReport(username, reportContent.reportType, {
        endDate: reportContent.parameters.endDate,
        startDate: reportContent.parameters.startDate,
      })

      expect(result).toEqual(reportContent)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getToken).toHaveBeenCalledWith(username)
      expect(statisticsClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(statisticsClient.findReport).toHaveBeenCalledWith(reportContent.reportType, {
        endDate: reportContent.parameters.endDate,
        startDate: reportContent.parameters.startDate,
      })
    })

    describe('when the statistics client throws an error', () => {
      it('returns null when the error status is 400', async () => {
        const clientError = Helpers.createApiError(400)
        statisticsClient.findReport.mockRejectedValue(clientError)

        const result = await service.getReport(username, reportContent.reportType, {
          endDate: reportContent.parameters.endDate,
          startDate: reportContent.parameters.startDate,
        })

        expect(result).toBeNull()
      })

      it('throws an error when the error status is not 400', async () => {
        const clientError = createError(500)
        statisticsClient.findReport.mockRejectedValue(clientError)

        await expect(
          service.getReport(username, reportContent.reportType, {
            endDate: reportContent.parameters.endDate,
            startDate: reportContent.parameters.startDate,
          }),
        ).rejects.toThrow(`Error fetching report data for ${reportContent.reportType}.`)
      })
    })
  })
})
