import OffenceUtils from './offenceUtils'
import { offenceDetailsFactory } from '../testutils/factories'

describe('OffenceUtils', () => {
  describe('summaryListRows', () => {
    it('formats offence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const offenceDetails = offenceDetailsFactory.build({
        code: 'RC123',
        date: '2020-01-01',
        description: 'Road traffic offence',
        statuteCodeDescription: 'RC1',
      })

      expect(OffenceUtils.summaryListRows(offenceDetails)).toEqual([
        {
          key: { text: 'Offence' },
          value: { text: 'Road traffic offence - RC123' },
        },
        {
          key: { text: 'Category' },
          value: { text: 'RC1' },
        },
        {
          key: { text: 'Offence date' },
          value: { text: '1 January 2020' },
        },
      ])
    })

    describe('when there is missing offence data', () => {
      it('formats a relevant message in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
        const offenceDetails = offenceDetailsFactory.build({
          code: undefined,
          date: undefined,
          description: undefined,
          statuteCodeDescription: undefined,
        })

        expect(OffenceUtils.summaryListRows(offenceDetails)).toEqual([
          {
            key: { text: 'Offence' },
            value: { text: 'There are no offence details for this person.' },
          },
          {
            key: { text: 'Category' },
            value: { text: 'There is no offence category for this person.' },
          },
          {
            key: { text: 'Offence date' },
            value: { text: 'There is no offence date for this person.' },
          },
        ])
      })
    })
  })
})
