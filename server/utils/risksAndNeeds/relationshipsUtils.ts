import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { Relationships } from '@accredited-programmes/api'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class RelationshipsUtils {
  static domesticViolenceSummaryListRows(
    relationships: Relationships,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: '6.7 - Evidence of domestic violence / partner abuse' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.dvEvidence) },
      },
      {
        key: { text: '6.7.1.1 - Is the victim a current or former partner?' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.victimFormerPartner) },
      },
      {
        key: { text: '6.7.1.2 - Is the victim a family member?' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.victimFamilyMember) },
      },
      {
        key: {
          text: '6.7.2.1 - Is the perpetrator a victim of partner or family abuse?',
        },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.victimOfPartnerFamily) },
      },
      {
        key: { text: '6.7.2.2 - Are they the perpetrator of partner or family abuse?' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.perpOfPartnerOrFamily) },
      },
    ]
  }
}
