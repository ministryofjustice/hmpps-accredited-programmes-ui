import DateUtils from './dateUtils'
import type { SentenceDetails } from '@accredited-programmes/models'
import type { GovukFrontendSummaryList } from '@govuk-frontend'

export default class SentenceInformationUtils {
  static summaryLists(sentenceDetails: SentenceDetails): Array<GovukFrontendSummaryList> {
    if (!sentenceDetails?.sentences) {
      return []
    }

    return sentenceDetails.sentences.map((sentence, index) => {
      const sentenceNumber = index + 1

      return {
        card: {
          attributes: {
            'data-testid': `sentence-details-summary-card-${sentenceNumber}`,
          },
          title: {
            text: `Sentence ${sentenceNumber}`,
          },
        },
        rows: [
          {
            key: { text: 'Type' },
            value: { text: sentence.description || 'There is no type for this sentence.' },
          },
          {
            key: { text: 'Date' },
            value: {
              text: sentence.sentenceStartDate
                ? DateUtils.govukFormattedFullDateString(sentence.sentenceStartDate)
                : 'There is no date for this sentence.',
            },
          },
        ],
      }
    })
  }
}
