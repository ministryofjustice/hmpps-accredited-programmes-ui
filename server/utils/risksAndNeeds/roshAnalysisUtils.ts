import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { RoshAnalysis } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class RoshAnalysisUtils {
  static previousBehaviourSummaryListRows(
    roshAnalysis: RoshAnalysis,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'What exactly did they do?' },
        value: { html: ShowRisksAndNeedsUtils.htmlTextValue(roshAnalysis.offenceDetails) },
      },
      {
        key: { text: 'Where and when did they do it?' },
        value: { html: ShowRisksAndNeedsUtils.htmlTextValue(roshAnalysis.whereAndWhen) },
      },
      {
        key: { text: 'How did they do it (was there any pre-planning, use of weapon, tool etc)?' },
        value: { html: ShowRisksAndNeedsUtils.htmlTextValue(roshAnalysis.howDone) },
      },
      {
        key: {
          text: 'Who were the victims (were there concerns about targeting, type, age, race or vulnerability of victim)?',
        },
        value: { html: ShowRisksAndNeedsUtils.htmlTextValue(roshAnalysis.whoVictims) },
      },
      {
        key: { text: 'Was anyone else present / involved?' },
        value: { html: ShowRisksAndNeedsUtils.htmlTextValue(roshAnalysis.anyoneElsePresent) },
      },
      {
        key: { text: 'Why did they do it (motivation and triggers)?' },
        value: { html: ShowRisksAndNeedsUtils.htmlTextValue(roshAnalysis.whyDone) },
      },
      {
        key: { text: 'Source of information' },
        value: { html: ShowRisksAndNeedsUtils.htmlTextValue(roshAnalysis.sources) },
      },
    ]
  }
}
