import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { Psychiatric } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class EmotionalWellbeingUtils {
  static psychiatricSummaryListRows(psychiatric: Psychiatric): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: '10.2 - Current psychological problems or depression' },
        value: { text: ShowRisksAndNeedsUtils.textValue(psychiatric.currPsychologicalProblems) },
      },
      {
        key: { text: '10.5 - Self-harm, attempted suicide, suicidal thoughts or feelings' },
        value: { text: ShowRisksAndNeedsUtils.textValue(psychiatric.selfHarmSuicidal) },
      },
      {
        key: { text: '10.6 - Current psychiatric problems' },
        value: { text: ShowRisksAndNeedsUtils.textValue(psychiatric.description) },
      },
    ]
  }
}
