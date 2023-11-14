import SentenceInformationUtils from './sentenceInformationUtils'
import type { Person } from '@accredited-programmes/models'
import type { OffenderSentenceAndOffences } from '@prison-api'

describe('SentenceInformationUtils', () => {
  describe('detailsSummaryListRows', () => {
    const type: OffenderSentenceAndOffences['sentenceTypeDescription'] = 'Concurrent determinate sentence'
    const startDate: Person['sentenceStartDate'] = '2010-10-31'

    it('formats sentence details in the appropriate format for passing to a GOV.UK Summary List nunjucks macro', () => {
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

    describe('when there is no sentence type', () => {
      it('returns a message for that field', () => {
        expect(SentenceInformationUtils.detailsSummaryListRows(startDate, undefined)).toEqual([
          {
            key: { text: 'Sentence type' },
            value: { text: 'There is no sentence type for this person.' },
          },
          {
            key: { text: 'Sentence start date' },
            value: { text: '31 October 2010' },
          },
        ])
      })
    })

    describe('when there is no sentence start date', () => {
      it('returns a message for that field', () => {
        expect(SentenceInformationUtils.detailsSummaryListRows(undefined, type)).toEqual([
          {
            key: { text: 'Sentence type' },
            value: { text: 'Concurrent determinate sentence' },
          },
          {
            key: { text: 'Sentence start date' },
            value: { text: 'There is no sentence start date for this person.' },
          },
        ])
      })
    })
  })
})
