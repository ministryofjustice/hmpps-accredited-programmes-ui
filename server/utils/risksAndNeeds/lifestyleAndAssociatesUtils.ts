import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { Lifestyle } from '@accredited-programmes-api'

export default class LifestyleAndAssociatesUtils {
  static criminalAssociatesSummaryListRows(
    lifestyleAndAssociates: Lifestyle,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Easily influenced by criminal associates?' },
        value: { text: ShowRisksAndNeedsUtils.textValue(lifestyleAndAssociates.easilyInfluenced) },
      },
    ]
  }

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
