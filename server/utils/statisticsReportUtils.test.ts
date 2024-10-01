import StatisticsReportUtils from './statisticsReportUtils'
import type { ReportContent } from '@accredited-programmes-api'

describe('StatisticsReportUtils', () => {
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
      expect(StatisticsReportUtils.reportContentDataBlock(reportContent, new Date('2022-01-01'))).toEqual({
        date: 'January 2022',
        testId: 'referral-count',
        title: 'Total referrals submitted',
        value: '1',
      })
    })

    describe('when report content is `null`', () => {
      it('returns the correct values', () => {
        expect(StatisticsReportUtils.reportContentDataBlock(null, new Date('2022-01-01'))).toEqual(
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
        expect(StatisticsReportUtils.reportContentDataBlock(reportContent, new Date('2022-01-01'))).toEqual(
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
