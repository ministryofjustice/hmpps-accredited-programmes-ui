import SentenceInformationUtils from './sentenceInformationUtils'
import { sentenceDetailsFactory } from '../testutils/factories'

describe('SentenceInformationUtils', () => {
  describe('summaryLists', () => {
    it('formats sentence details in the appropriate format for passing to a GOV.UK Summary List nunjucks macro', () => {
      const sentenceDetails = sentenceDetailsFactory.build({
        sentences: [
          {
            description: 'Indeterminate Sentence for the Public Protection',
            sentenceStartDate: '2011-08-31',
          },
          {
            description: 'Concurrent determinate sentence',
            sentenceStartDate: '2010-10-31',
          },
        ],
      })

      expect(SentenceInformationUtils.summaryLists(sentenceDetails)).toEqual([
        {
          card: {
            attributes: {
              'data-testid': 'sentence-details-summary-card-1',
            },
            title: {
              text: 'Sentence 1',
            },
          },
          rows: [
            {
              key: { text: 'Type' },
              value: { text: 'Indeterminate Sentence for the Public Protection' },
            },
            {
              key: { text: 'Date' },
              value: { text: '31 August 2011' },
            },
          ],
        },
        {
          card: {
            attributes: {
              'data-testid': 'sentence-details-summary-card-2',
            },
            title: {
              text: 'Sentence 2',
            },
          },
          rows: [
            {
              key: { text: 'Type' },
              value: { text: 'Concurrent determinate sentence' },
            },
            {
              key: { text: 'Date' },
              value: { text: '31 October 2010' },
            },
          ],
        },
      ])
    })

    describe('when there are no sentences', () => {
      it('returns an empty array', () => {
        expect(SentenceInformationUtils.summaryLists({})).toEqual([])
      })
    })
  })
})
