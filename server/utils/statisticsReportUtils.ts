import type { ReportContent } from '@accredited-programmes-api'

interface ReportContentDataBlock {
  date: string
  testId: string
  title: string
  value: string
}

export default class StatisticsReportUtils {
  static reportContentDataBlock(reportContent: ReportContent | null, date: Date): ReportContentDataBlock {
    const monthAndYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    return {
      date: monthAndYear,
      testId: reportContent?.reportType.replace(/_/g, '-').toLowerCase() || 'unknown',
      title: this.reportContentTitle(reportContent?.reportType),
      value: reportContent?.content.count?.toString() || '0',
    }
  }

  static reportContentTitle(reportType?: ReportContent['reportType']): string {
    switch (reportType) {
      case 'REFERRAL_COUNT':
        return 'Total referrals submitted'
      case 'PROGRAMME_COMPLETE_COUNT':
        return 'Total programmes completed'
      case 'NOT_ELIGIBLE_COUNT':
        return 'Total referrals not eligible'
      case 'WITHDRAWN_COUNT':
        return 'Total referrals withdrawn'
      case 'DESELECTED_COUNT':
        return 'Total referrals deselected'
      default:
        return 'Unknown'
    }
  }
}
