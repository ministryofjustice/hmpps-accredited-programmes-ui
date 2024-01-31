import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { RoshAnalysis } from '@accredited-programmes/api'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class RoshAnalysisUtils {
  static previousBehaviourSummaryListRows(
    roshAnalysis: RoshAnalysis,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'What exactly did they do?' },
        value: { text: ShowRisksAndNeedsUtils.textValue(roshAnalysis.offenceDetails) },
      },
      {
        key: { text: 'Where and when did they do it?' },
        value: { text: ShowRisksAndNeedsUtils.textValue(roshAnalysis.whereAndWhen) },
      },
      {
        key: { text: 'How did they do it (was there any pre-planning, use of weapon, tool etc)?' },
        value: { text: ShowRisksAndNeedsUtils.textValue(roshAnalysis.howDone) },
      },
      {
        key: {
          text: 'Who were the victims (were there concerns about targeting, type, age, race or vulnerability of victim)?',
        },
        value: { text: ShowRisksAndNeedsUtils.textValue(roshAnalysis.whoVictims) },
      },
      {
        key: { text: 'Was anyone else present / involved?' },
        value: { text: ShowRisksAndNeedsUtils.textValue(roshAnalysis.anyoneElsePresent) },
      },
      {
        key: { text: 'Why did they do it (motivation and triggers)?' },
        value: { text: ShowRisksAndNeedsUtils.textValue(roshAnalysis.whyDone) },
      },
      {
        key: { text: 'Source of information' },
        value: { text: ShowRisksAndNeedsUtils.textValue(roshAnalysis.sources) },
      },
    ]
  }
}
