import OffenceUtils from './offenceUtils'

describe('OffenceUtils', () => {
  describe('summaryListRows', () => {
    it('formats offence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const offenceWithDetail = {
        category: 'RC1',
        description: 'Road traffic offence',
        offenceCode: 'RC123',
        offenceDate: '2020-01-01',
      }

      expect(OffenceUtils.summaryListRows(offenceWithDetail)).toEqual([
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
  })
})
