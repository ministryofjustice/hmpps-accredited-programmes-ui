import SentenceInformationUtils from './sentenceInformationUtils'
import { sentenceAndOffenceDetailsFactory } from '../testutils/factories'

describe('SentenceInformationUtils', () => {
  describe('detailsSummaryListRows', () => {
    it('formats sentence detailsin the appropriate format for passing to a GOV.UK Summary List nunjucks macro', () => {
      const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build({
        sentenceStartDate: '2010-10-31',
        sentenceTypeDescription: 'Concurrent determinate sentence',
      })

      expect(SentenceInformationUtils.detailsSummaryListRows(sentenceAndOffenceDetails)).toEqual([
        {
          key: { text: 'Sentence type' },
          value: { text: 'Concurrent determinate sentence' },
        },
        {
          key: { text: 'Sentence start date' },
          value: { text: '31 October 2010' },
        },
      ])
    })
  })
})
