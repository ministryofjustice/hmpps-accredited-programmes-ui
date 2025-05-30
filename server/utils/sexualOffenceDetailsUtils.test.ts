import SexualOffenceDetailsUtils from './sexualOffenceDetailsUtils'
import { sexualOffenceDetailsFactory } from '../testutils/factories'

describe('SexualOffenceDetailsUtils', () => {
  describe('offenceSummaryListRows', () => {
    it('returns a formatted array of sexual offence details data to use with UI summary lists', () => {
      const sexualOffenceDetails = [
        sexualOffenceDetailsFactory.build({ description: 'offence1', score: 1 }),
        sexualOffenceDetailsFactory.build({ description: 'offence2', score: 2 }),
      ]

      expect(SexualOffenceDetailsUtils.offenceSummaryListRows(sexualOffenceDetails)).toEqual([
        {
          key: { text: 'offence1' },
          value: { text: '1' },
        },
        {
          key: { text: 'offence2' },
          value: { text: '2' },
        },
        {
          key: { text: 'Total' },
          value: { text: '3' },
        },
      ])
    })
  })
})
