import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { Behaviour } from '@accredited-programmes-api'

export default class ThinkingAndBehavingUtils {
  static thinkingAndBehavingSummaryListRows(behaviour: Behaviour): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: '11.2 - Impulsivity' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.impulsivity) },
      },
      {
        key: { text: '11.3 - Aggressive or controlling behaviour' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.aggressiveControllingBehaviour) },
      },
      {
        key: { text: '11.4 - Temper control' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.temperControl) },
      },
      {
        key: { text: '11.6 - Problem solving skills' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.problemSolvingSkills) },
      },
      {
        key: { text: '11.7 - Awareness of consequences' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.awarenessOfConsequences) },
      },
      {
        key: { text: '11.8 - Achieves goals (optional)' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.achieveGoals) },
      },
      {
        key: { text: "11.9 - Understands other people's views" },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.understandsViewsOfOthers) },
      },
      {
        key: { text: '11.10 - Concrete or abstract thinking (optional)' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.concreteAbstractThinking) },
      },
      {
        key: { text: '11.11 - Sexual preoccupation' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.sexualPreOccupation) },
      },
      {
        key: { text: '11.12 - Offence-related sexual interests' },
        value: { text: ShowRisksAndNeedsUtils.textValue(behaviour.offenceRelatedSexualInterests) },
      },
    ]
  }
}
