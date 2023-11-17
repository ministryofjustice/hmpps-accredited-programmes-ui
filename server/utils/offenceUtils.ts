import DateUtils from './dateUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue, OffenceDetails } from '@accredited-programmes/ui'

export default class OffenceUtils {
  static summaryListRows(offence: OffenceDetails): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Offence' },
        value: {
          text:
            [offence.description, offence.code].filter(string => string).join(' - ') ||
            'There are no offence details for this person.',
        },
      },
      {
        key: { text: 'Category' },
        value: { text: offence.statuteCodeDescription || 'There is no offence category for this person.' },
      },
      {
        key: { text: 'Offence date' },
        value: {
          text: offence.date
            ? DateUtils.govukFormattedFullDateString(offence.date)
            : 'There is no offence date for this person.',
        },
      },
    ]
  }
}
