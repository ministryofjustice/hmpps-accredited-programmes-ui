import DateUtils from './dateUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue, OffenceDetails } from '@accredited-programmes/ui'

export default class OffenceUtils {
  static summaryListRows(offence: OffenceDetails): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Offence' },
        value: { text: `${offence.description} - ${offence.code}` },
      },
      {
        key: { text: 'Category' },
        value: { text: offence.statuteCodeDescription },
      },
      {
        key: { text: 'Offence date' },
        value: { text: DateUtils.govukFormattedFullDateString(offence.date) },
      },
    ]
  }
}
