import ThinkingAndBehavingUtils from './thinkingAndBehavingUtils'
import { behaviourFactory } from '../../testutils/factories'

describe('ThinkingAndBehavingUtils', () => {
  const roshAnalysis = behaviourFactory.build({
    achieveGoals: '1 - Some problems',
    awarenessOfConsequences: '2 - Some problems',
    concreteAbstractThinking: '3 - Some problems',
    problemSolvingSkills: '4 - Some problems',
    temperControl: '5 - Some problems',
    understandsViewsOfOthers: '6 - Some problems',
  })

  describe('previousBehaviourSummaryListRows', () => {
    it('formats the behaviour data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(ThinkingAndBehavingUtils.thinkingAndBehavingSummaryListRows(roshAnalysis)).toEqual([
        {
          key: { text: '11.4 - Temper control' },
          value: { text: '5 - Some problems' },
        },
        {
          key: { text: '11.6 - Problem solving skills' },
          value: { text: '4 - Some problems' },
        },
        {
          key: { text: '11.7 - Awareness of consequences' },
          value: { text: '2 - Some problems' },
        },
        {
          key: { text: '11.8 - Achieves goals (optional)' },
          value: { text: '1 - Some problems' },
        },
        {
          key: { text: "11.9 - Understands other people's views" },
          value: { text: '6 - Some problems' },
        },
        {
          key: { text: '11.10 - Concrete / abstract thinking (optional)' },
          value: { text: '3 - Some problems' },
        },
      ])
    })
  })
})
