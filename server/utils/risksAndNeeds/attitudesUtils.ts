import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { Attitude } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class AttitudesUtils {
  static attitudesSummaryListRows(attitude: Attitude): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: '12.1 - Pro-criminal attitudes' },
        value: { text: ShowRisksAndNeedsUtils.textValue(attitude.proCriminalAttitudes) },
      },
      {
        key: { text: '12.8 - Motivation to address offending behaviour' },
        value: { text: ShowRisksAndNeedsUtils.textValue(attitude.motivationToAddressBehaviour) },
      },
    ]
  }
}
