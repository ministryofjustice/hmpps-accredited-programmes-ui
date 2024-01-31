import DateUtils from './dateUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue, Person } from '@accredited-programmes/ui'
import type { OffenderSentenceAndOffences } from '@prison-api'

export default class SentenceInformationUtils {
  static detailsSummaryListRows(
    startDate: Person['sentenceStartDate'],
    type: OffenderSentenceAndOffences['sentenceTypeDescription'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Sentence type' },
        value: { text: type || 'There is no sentence type for this person.' },
      },
      {
        key: { text: 'Sentence start date' },
        value: {
          text: startDate
            ? DateUtils.govukFormattedFullDateString(startDate)
            : 'There is no sentence start date for this person.',
        },
      },
    ]
  }
}
