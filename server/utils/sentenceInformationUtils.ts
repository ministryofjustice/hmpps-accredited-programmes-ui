import DateUtils from './dateUtils'
import type { Person } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithValue } from '@accredited-programmes/ui'
import type { SentenceAndOffenceDetails } from '@prison-api'

export default class SentenceInformationUtils {
  static detailsSummaryListRows(
    startDate: Person['sentenceStartDate'],
    type: SentenceAndOffenceDetails['sentenceTypeDescription'],
  ): Array<GovukFrontendSummaryListRowWithValue> {
    return [
      {
        key: { text: 'Sentence type' },
        value: { text: type },
      },
      {
        key: { text: 'Sentence start date' },
        value: { text: startDate ? DateUtils.govukFormattedFullDateString(startDate) : '' },
      },
    ]
  }
}
