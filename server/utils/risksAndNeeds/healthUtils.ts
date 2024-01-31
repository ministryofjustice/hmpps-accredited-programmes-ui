import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { Health } from '@accredited-programmes/api'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class HealthUtils {
  static healthSummaryListRows(health: Health): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    let generalHealthTextString = ShowRisksAndNeedsUtils.yesOrNo(health.anyHealthConditions)

    if (health.anyHealthConditions) {
      generalHealthTextString += `<br><br>${ShowRisksAndNeedsUtils.textValue(health.description)}`
    }

    return [
      {
        key: { text: 'General health - any physical or mental health conditions? (optional)' },
        value: { html: generalHealthTextString },
      },
    ]
  }
}
