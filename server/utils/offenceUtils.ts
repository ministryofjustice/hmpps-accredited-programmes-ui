import DateUtils from './dateUtils'
import type { GovukFrontendSummaryListRowWithValue, OffenceWithDetail } from '@accredited-programmes/ui'

export default class OffenceUtils {
  static summaryListRows(offence: OffenceWithDetail): Array<GovukFrontendSummaryListRowWithValue> {
    return [
      {
        key: { text: 'Offence' },
        value: { text: `${offence.description} - ${offence.offenceCode}` },
      },
      {
        key: { text: 'Category' },
        value: { text: offence.category },
      },
      {
        key: { text: 'Offence date' },
        value: { text: DateUtils.govukFormattedFullDateString(offence.offenceDate) },
      },
    ]
  }
}
