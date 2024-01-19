import EmotionalWellbeingUtils from './emotionalWellbeingUtils'
import { psychiatricFactory } from '../../testutils/factories'
import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'

jest.mock('../referrals/showRisksAndNeedsUtils')

describe('EmotionalWellbeingUtils', () => {
  const psychiatric = psychiatricFactory.build({
    description: '0-No problems',
  })

  describe('psychiatricSummaryListRows', () => {
    it('formats phsychiatric data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      ;(ShowRisksAndNeedsUtils.textValue as jest.Mock).mockReturnValue(psychiatric.description)

      expect(EmotionalWellbeingUtils.psychiatricSummaryListRows(psychiatric)).toEqual([
        {
          key: { text: 'Current psychiatric problems' },
          value: { text: psychiatric.description },
        },
      ])
    })
  })
})
