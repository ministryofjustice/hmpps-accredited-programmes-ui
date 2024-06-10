import EmotionalWellbeingUtils from './emotionalWellbeingUtils'
import { psychiatricFactory } from '../../testutils/factories'

describe('EmotionalWellbeingUtils', () => {
  const psychiatric = psychiatricFactory.build({
    currPsychologicalProblems: '0-No problems',
    description: '0-No problems',
    difficultiesCoping: '1-Some problems',
    selfHarmSuicidal: 'No-0',
  })

  describe('psychiatricSummaryListRows', () => {
    it('formats phsychiatric data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(EmotionalWellbeingUtils.psychiatricSummaryListRows(psychiatric)).toEqual([
        {
          key: { text: '10.2 - Current psychological problems or depression' },
          value: { text: psychiatric.currPsychologicalProblems },
        },
        {
          key: { text: '10.5 - Self-harm, attempted suicide, suicidal thoughts or feelings' },
          value: { text: psychiatric.selfHarmSuicidal },
        },
        {
          key: { text: '10.6 - Current psychiatric problems' },
          value: { text: psychiatric.description },
        },
      ])
    })
  })
})
