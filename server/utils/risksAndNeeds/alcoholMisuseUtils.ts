import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { DrugAlcoholDetail } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class AlcoholMisuseUtils {
  static summaryListRows(
    alcoholDetails: DrugAlcoholDetail['alcohol'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: '9.1 - Is current use a problem?' },
        value: {
          html: `${ShowRisksAndNeedsUtils.textValue(alcoholDetails.alcoholLinkedToHarm)}<br><br>${ShowRisksAndNeedsUtils.textValue(alcoholDetails.alcoholIssuesDetails)}`,
        },
      },
      {
        key: { text: '9.2 - Binge drinking or excessive alcohol use in the last 6 months' },
        value: { text: ShowRisksAndNeedsUtils.textValue(alcoholDetails.bingeDrinking) },
      },
      {
        key: { text: '9.3 - Level of alcohol misuse in the past' },
        value: { text: ShowRisksAndNeedsUtils.textValue(alcoholDetails.frequencyAndLevel) },
      },
    ]
  }
}
