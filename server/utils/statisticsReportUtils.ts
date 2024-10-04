import DateUtils from './dateUtils'
import type { QueryParam } from '@accredited-programmes/ui'
import type { ReportContent } from '@accredited-programmes-api'
import type { GovukFrontendErrorMessage } from '@govuk-frontend'

interface ReportContentDataBlock {
  testId: string
  title: string
  value: string
}

export default class StatisticsReportUtils {
  static filterValuesToApiParams(
    period?: string,
    dateFrom?: string,
    dateTo?: string,
  ): { endDate: string; startDate: string } {
    if (period === 'custom' && dateFrom && dateTo) {
      return {
        endDate: DateUtils.isoDateOnly(DateUtils.convertStringToDate(dateTo)),
        startDate: DateUtils.isoDateOnly(DateUtils.convertStringToDate(dateFrom)),
      }
    }

    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    let searchEndDate = new Date(year, month, 0)
    let searchStartDate = new Date(year, month - 1, 1)

    if (period === 'lastQuarter') {
      const { endDate, startDate } = this.lastFinancialQuarter()
      searchEndDate = endDate
      searchStartDate = startDate
    }

    if (period === 'lastSixMonths') {
      searchStartDate = new Date(year, month - 6, 1)
    }

    return {
      endDate: DateUtils.isoDateOnly(searchEndDate),
      startDate: DateUtils.isoDateOnly(searchStartDate),
    }
  }

  static lastFinancialQuarter(): { endDate: Date; startDate: Date } {
    const now = new Date()
    const currentMonth = now.getMonth()
    let currentYear = now.getFullYear()

    const quarters = [
      /* eslint-disable sort-keys */
      { start: 0, end: 2 },
      { start: 3, end: 5 },
      { start: 6, end: 8 },
      { start: 9, end: 11 },
      /* eslint-enable sort-keys */
    ]

    let quarterIndex = Math.floor(currentMonth / 3)

    if (quarterIndex === 0) {
      currentYear -= 1
      quarterIndex = 3
    } else {
      quarterIndex -= 1
    }

    const { start, end } = quarters[quarterIndex]
    const startDate = new Date(currentYear, start, 1)
    const endDate = new Date(currentYear, end + 1, 0)

    return { endDate, startDate }
  }

  static queryParams(
    period?: string,
    location?: string,
    region?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Array<QueryParam> {
    const queryParams: Array<QueryParam> = []

    if (period) {
      queryParams.push({ key: 'period', value: period })
    }

    if (period === 'custom') {
      if (dateFrom) {
        queryParams.push({ key: 'dateFrom', value: dateFrom })
      }

      if (dateTo) {
        queryParams.push({ key: 'dateTo', value: dateTo })
      }
    }

    if (location && region === 'prison') {
      queryParams.push({ key: 'location', value: location })
    }

    if (region) {
      queryParams.push({ key: 'region', value: region })
    }

    return queryParams
  }

  static reportContentDataBlock(reportContent: ReportContent | null): ReportContentDataBlock {
    return {
      testId: reportContent?.reportType.replace(/_/g, '-').toLowerCase() || 'unknown',
      title: this.reportContentTitle(reportContent?.reportType),
      value: reportContent?.content.count?.toString() || '0',
    }
  }

  static reportContentTitle(reportType?: ReportContent['reportType']): string {
    switch (reportType) {
      case 'REFERRAL_COUNT':
        return 'Total referrals submitted'
      case 'ON_PROGRAMME_COUNT':
        return 'Total programmes started'
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

  static validateFilterValues(
    period?: string,
    dateFrom?: string,
    dateTo?: string,
    region?: string,
    location?: string,
  ): Record<string, GovukFrontendErrorMessage> {
    const errorMessages: Record<string, GovukFrontendErrorMessage> = {}
    const invalidDateText = 'Enter a valid date'
    const missingDateText = 'Enter a date'
    const earliestDateText = 'Date must be after 8 May 2024'
    const futureDateText = 'Date cannot be in the future'

    if (period === 'custom') {
      if (!dateFrom) {
        errorMessages.dateFrom = { text: missingDateText }
      } else if (Number.isNaN(DateUtils.convertStringToDate(dateFrom).getTime())) {
        errorMessages.dateFrom = { text: invalidDateText }
      }

      if (!dateTo) {
        errorMessages.dateTo = { text: missingDateText }
      } else if (Number.isNaN(DateUtils.convertStringToDate(dateTo).getTime())) {
        errorMessages.dateTo = { text: invalidDateText }
      }

      if (dateFrom && dateTo) {
        const dateNow = new Date().getTime()
        const earliestDate = new Date(2024, 4, 8).getTime()
        const dateFromTime = DateUtils.convertStringToDate(dateFrom).getTime()
        const dateToTime = DateUtils.convertStringToDate(dateTo).getTime()

        if (dateFromTime > dateToTime) {
          errorMessages.dateTo = { text: 'Date must be after date from' }
        }

        if (dateFromTime < earliestDate) {
          errorMessages.dateFrom = { text: earliestDateText }
        }

        if (dateFromTime > dateNow) {
          errorMessages.dateFrom = { text: futureDateText }
        }

        if (dateToTime > dateNow) {
          errorMessages.dateTo = { text: futureDateText }
        }

        if (dateToTime < earliestDate) {
          errorMessages.dateTo = { text: earliestDateText }
        }
      }
    }

    if (region === 'prison' && !location) {
      errorMessages.location = { text: 'Select a prison' }
    }

    return errorMessages
  }
}
