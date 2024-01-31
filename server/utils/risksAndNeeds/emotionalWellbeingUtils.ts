import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { Psychiatric } from '@accredited-programmes/api'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class EmotionalWellbeingUtils {
  static psychiatricSummaryListRows(psychiatric: Psychiatric): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Current psychiatric problems' },
        value: { text: ShowRisksAndNeedsUtils.textValue(psychiatric.description) },
      },
    ]
  }
}
