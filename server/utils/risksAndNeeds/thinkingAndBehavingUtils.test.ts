import ThinkingAndBehavingUtils from './thinkingAndBehavingUtils'
import { behaviourFactory } from '../../testutils/factories'

describe('ThinkingAndBehavingUtils', () => {
  const behaviour = behaviourFactory.build({
    achieveGoals: '1 - Some problems',
    aggressiveControllingBehaviour: '2 - Some problems',
    awarenessOfConsequences: '3 - Some problems',
    concreteAbstractThinking: '4 - Some problems',
    impulsivity: '5 - Some problems',
    offenceRelatedSexualInterests: '6 - Some problems',
    problemSolvingSkills: '7 - Some problems',
    sexualPreOccupation: '8 - Some problems',
    temperControl: '9 - Some problems',
    understandsViewsOfOthers: '10 - Some problems',
  })

  describe('previousBehaviourSummaryListRows', () => {
    it('formats the behaviour data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(ThinkingAndBehavingUtils.thinkingAndBehavingSummaryListRows(behaviour)).toEqual([
        {
          key: { text: '11.2 - Impulsivity' },
          value: { text: '5 - Some problems' },
        },
        {
          key: { text: '11.3 - Aggressive or controlling behaviour' },
          value: { text: '2 - Some problems' },
        },
        {
          key: { text: '11.4 - Temper control' },
          value: { text: '9 - Some problems' },
        },
        {
          key: { text: '11.6 - Problem solving skills' },
          value: { text: '7 - Some problems' },
        },
        {
          key: { text: '11.7 - Awareness of consequences' },
          value: { text: '3 - Some problems' },
        },
        {
          key: { text: '11.8 - Achieves goals (optional)' },
          value: { text: '1 - Some problems' },
        },
        {
          key: { text: "11.9 - Understands other people's views" },
          value: { text: '10 - Some problems' },
        },
        {
          key: { text: '11.10 - Concrete or abstract thinking (optional)' },
          value: { text: '4 - Some problems' },
        },
        {
          key: { text: '11.11 - Sexual preoccupation' },
          value: { text: '8 - Some problems' },
        },
        {
          key: { text: '11.12 - Offence-related sexual interests' },
          value: { text: '6 - Some problems' },
        },
      ])
    })
  })
})
