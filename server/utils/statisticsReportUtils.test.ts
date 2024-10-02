import StatisticsReportUtils from './statisticsReportUtils'
import type { ReportContent } from '@accredited-programmes-api'

describe('StatisticsReportUtils', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe('filterValuesToApiParams', () => {
    it.each([
      // Default is last full month, so July 2024
      [undefined, { endDate: '2024-07-31', startDate: '2024-07-01' }],
      // 1 April 2024 to 30 June 2024
      ['lastQuarter', { endDate: '2024-06-30', startDate: '2024-04-01' }],
      // 1 February 2024 to 31 July 2024,
      ['lastSixMonths', { endDate: '2024-07-31', startDate: '2024-02-01' }],
    ])('returns the correct start and end date for the given period', (period, expected) => {
      // 15th of August 2024
      jest.useFakeTimers().setSystemTime(new Date(2024, 7, 15))

      expect(StatisticsReportUtils.filterValuesToApiParams(period)).toEqual(expected)
    })

    describe('when periods can carry over into the previous year', () => {
      it('returns the correct last full month by default', () => {
        // 15th of January 2024
        jest.useFakeTimers().setSystemTime(new Date(2024, 0, 15))

        // December 2023
        expect(StatisticsReportUtils.filterValuesToApiParams()).toEqual({
          endDate: '2023-12-31',
          startDate: '2023-12-01',
        })
      })

      it('returns the correct start and end date for the `lastSixMonths`', () => {
        // 15th of April 2024
        jest.useFakeTimers().setSystemTime(new Date(2024, 3, 15))

        // 1st of October 2023 to 31st of March 2024
        expect(StatisticsReportUtils.filterValuesToApiParams('lastSixMonths')).toEqual({
          endDate: '2024-03-31',
          startDate: '2023-10-01',
        })
      })
    })
  })

  describe('lastFinancialQuarter', () => {
    it.each([
      // 1st of January 2022 should be Q3 in 2021
      [new Date(2022, 0, 1), { endDate: new Date(2021, 11, 31), startDate: new Date(2021, 9, 1) }],
      // 1st of April 2022 should be Q4 in 2022
      [new Date(2022, 3, 1), { endDate: new Date(2022, 2, 31), startDate: new Date(2022, 0, 1) }],
      // 1st of July 2022 should be Q1 in 2022
      [new Date(2022, 6, 1), { endDate: new Date(2022, 5, 30), startDate: new Date(2022, 3, 1) }],
      // 1st of October 2022 should be Q2 in 2022
      [new Date(2022, 9, 1), { endDate: new Date(2022, 8, 30), startDate: new Date(2022, 6, 1) }],
    ])('return the start end end date of the last full quarter', (now, expected) => {
      jest.useFakeTimers().setSystemTime(now)

      expect(StatisticsReportUtils.lastFinancialQuarter()).toEqual(expected)
    })
  })

  describe('queryParams', () => {
    it('returns all the query params', () => {
      expect(StatisticsReportUtils.queryParams('lastQuarter', 'MDI', 'prison')).toEqual([
        { key: 'period', value: 'lastQuarter' },
        { key: 'location', value: 'MDI' },
      ])
    })

    describe("when `location` is provided on it's own", () => {
      it('returns no query params', () => {
        expect(StatisticsReportUtils.queryParams(undefined, 'MDI')).toEqual([])
      })
    })

    describe('when `location` and `region` are provided', () => {
      it('returns only the `location` query param', () => {
        expect(StatisticsReportUtils.queryParams(undefined, 'MDI', 'prison')).toEqual([
          { key: 'location', value: 'MDI' },
        ])
      })
    })

    describe('when only the `period` is provided', () => {
      it('returns only the `period` key', () => {
        expect(StatisticsReportUtils.queryParams('lastQuarter')).toEqual([{ key: 'period', value: 'lastQuarter' }])
      })
    })
  })

  describe('reportContentDataBlock', () => {
    const reportContent: ReportContent = {
      content: {
        count: 1,
        courseCounts: [
          {
            audience: 'audience',
            count: 1,
            name: 'name',
          },
        ],
      },
      parameters: {
        endDate: '2022-01-01',
        startDate: '2022-01-31',
      },
      reportType: 'REFERRAL_COUNT',
    }
    it('returns the report content data block', () => {
      expect(StatisticsReportUtils.reportContentDataBlock(reportContent)).toEqual({
        testId: 'referral-count',
        title: 'Total referrals submitted',
        value: '1',
      })
    })

    describe('when report content is `null`', () => {
      it('returns the correct values', () => {
        expect(StatisticsReportUtils.reportContentDataBlock(null)).toEqual(
          expect.objectContaining({
            testId: 'unknown',
            value: '0',
          }),
        )
      })
    })

    describe('when there is no count value', () => {
      it('returns the correct values', () => {
        reportContent.content.count = undefined
        expect(StatisticsReportUtils.reportContentDataBlock(reportContent)).toEqual(
          expect.objectContaining({
            value: '0',
          }),
        )
      })
    })
  })

  describe('reportContentTitle', () => {
    it('returns the title for the given report type', () => {
      expect(StatisticsReportUtils.reportContentTitle('REFERRAL_COUNT')).toEqual('Total referrals submitted')
      expect(StatisticsReportUtils.reportContentTitle('PROGRAMME_COMPLETE_COUNT')).toEqual('Total programmes completed')
      expect(StatisticsReportUtils.reportContentTitle('NOT_ELIGIBLE_COUNT')).toEqual('Total referrals not eligible')
      expect(StatisticsReportUtils.reportContentTitle('WITHDRAWN_COUNT')).toEqual('Total referrals withdrawn')
      expect(StatisticsReportUtils.reportContentTitle('DESELECTED_COUNT')).toEqual('Total referrals deselected')
    })

    describe('when the report type is unknown', () => {
      it('returns "Unknown"', () => {
        expect(StatisticsReportUtils.reportContentTitle('UNKNOWN')).toEqual('Unknown')
      })
    })

    describe('when the report type is undefined', () => {
      it('returns "Unknown"', () => {
        expect(StatisticsReportUtils.reportContentTitle(undefined)).toEqual('Unknown')
      })
    })
  })
})
