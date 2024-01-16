import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { Lifestyle } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class LifestyleAndAssociatesUtils {
  static reoffendingSummaryListRows(
    lifestyleAndAssociates: Lifestyle,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Are there regular activities that encourage reoffending?' },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(lifestyleAndAssociates.activitiesEncourageOffending),
        },
      },
    ]
  }
}
