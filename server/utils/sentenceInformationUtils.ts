import DateUtils from './dateUtils'
import type { GovukFrontendSummaryListRowWithValue } from '@accredited-programmes/ui'
import type { SentenceAndOffenceDetails } from '@prison-api'

export default class SentenceInformationUtils {
  static detailsSummaryListRows(
    sentenceAndOffenceDetails: SentenceAndOffenceDetails,
  ): Array<GovukFrontendSummaryListRowWithValue> {
    return [
      {
        key: { text: 'Sentence type' },
        value: { text: sentenceAndOffenceDetails.sentenceTypeDescription },
      },
      {
        key: { text: 'Sentence start date' },
        value: { text: DateUtils.govukFormattedFullDateString(sentenceAndOffenceDetails.sentenceStartDate) },
      },
    ]
  }
}
