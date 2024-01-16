import LifestyleAndAssociatesUtils from './lifestyleAndAssociatesUtils'
import { lifestyleFactory } from '../../testutils/factories'

describe('LifestyleAndAssociatesUtils', () => {
  const lifestyle = lifestyleFactory.build({ activitiesEncourageOffending: '0 - No problems' })

  describe('reoffendingSummaryListRows', () => {
    it('formats the lifestyle data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(LifestyleAndAssociatesUtils.reoffendingSummaryListRows(lifestyle)).toEqual([
        {
          key: { text: 'Are there regular activities that encourage reoffending?' },
          value: {
            text: '0 - No problems',
          },
        },
      ])
    })
  })
})
