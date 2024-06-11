import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { DrugAlcoholDetail } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class DrugMisuseUtils {
  static summaryListRows(drugDetails: DrugAlcoholDetail['drug']): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: '8.5 - Level of use of main drug' },
        value: { text: ShowRisksAndNeedsUtils.textValue(drugDetails.levelOfUseOfMainDrug) },
      },
      {
        key: { text: '8.9 - Using and obtaining drugs a major activity or occupation' },
        value: { text: ShowRisksAndNeedsUtils.textValue(drugDetails.drugsMajorActivity) },
      },
    ]
  }
}
