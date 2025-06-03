import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { SexualOffenceDetails } from '@accredited-programmes-api'

export default class SexualOffenceDetailsUtils {
  static offenceSummaryListRows(
    offenceDetails: Array<SexualOffenceDetails>,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const rows = offenceDetails.map(detail => ({
      key: { text: detail.description },
      value: { text: detail.score.toString() },
    }))

    rows.push({
      key: { text: 'Total' },
      value: { text: offenceDetails.reduce((total, detail) => total + detail.score, 0).toString() },
    })

    return rows
  }
}
