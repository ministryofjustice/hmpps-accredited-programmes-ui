import AttitudesUtils from './attitudesUtils'
import { attitudeFactory } from '../../testutils/factories'

describe('AttitudesUtils', () => {
  const attitude = attitudeFactory.build({
    motivationToAddressBehaviour: '1 - Quite motivated',
    proCriminalAttitudes: '1 - Some problems',
  })

  describe('attitudesSummaryListRows', () => {
    it('formats the behaviour data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(AttitudesUtils.attitudesSummaryListRows(attitude)).toEqual([
        {
          key: { text: '12.1 - Pro-criminal attitudes' },
          value: { text: '1 - Some problems' },
        },
        {
          key: { text: '12.8 - Motivation to address offending behaviour' },
          value: { text: '1 - Quite motivated' },
        },
      ])
    })
  })
})
