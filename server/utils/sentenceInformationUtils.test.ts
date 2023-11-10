import SentenceInformationUtils from './sentenceInformationUtils'
import type { Person } from '@accredited-programmes/models'
import type { OffenderSentenceAndOffences } from '@prison-api'

describe('SentenceInformationUtils', () => {
  describe('detailsSummaryListRows', () => {
    const type: OffenderSentenceAndOffences['sentenceTypeDescription'] = 'Concurrent determinate sentence'

    it('formats sentence details in the appropriate format for passing to a GOV.UK Summary List nunjucks macro', () => {
      const startDate: Person['sentenceStartDate'] = '2010-10-31'

      expect(SentenceInformationUtils.detailsSummaryListRows(startDate, type)).toEqual([
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

    describe('when there is no sentence start date', () => {
      it('returns an empty string against that field', () => {
        expect(SentenceInformationUtils.detailsSummaryListRows(undefined, type)).toEqual([
          {
            key: { text: 'Sentence type' },
            value: { text: 'Concurrent determinate sentence' },
          },
          {
            key: { text: 'Sentence start date' },
            value: { text: '' },
          },
        ])
      })
    })
  })
})
