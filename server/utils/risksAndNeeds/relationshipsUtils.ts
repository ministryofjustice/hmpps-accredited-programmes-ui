import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { Relationships } from '@accredited-programmes-api'

export default class RelationshipsUtils {
  static closeRelationshipsSummaryListRows(
    relationships: Relationships,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Previous experience of close relationships' },
        value: { text: ShowRisksAndNeedsUtils.textValue(relationships.prevCloseRelationships) },
      },
    ]
  }

  static domesticViolenceSummaryListRows(
    relationships: Relationships,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Evidence of domestic violence or partner abuse' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.dvEvidence) },
      },
      {
        key: { text: 'Is the victim a current or former partner?' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.victimFormerPartner) },
      },
      {
        key: { text: 'Is the victim a family member?' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.victimFamilyMember) },
      },
      {
        key: {
          text: 'Is the perpetrator a victim of partner or family abuse?',
        },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.victimOfPartnerFamily) },
      },
      {
        key: { text: 'Are they the perpetrator of partner or family abuse?' },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(relationships.perpOfPartnerOrFamily) },
      },
    ]
  }

  static familyRelationshipsSummaryListRows(
    relationships: Relationships,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Current relationship with close family members' },
        value: { text: ShowRisksAndNeedsUtils.textValue(relationships.relCloseFamily) },
      },
    ]
  }

  static relationshipToChildrenSummaryListRows(
    relationships: Relationships,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Emotional congruence with children, or feeling closer to children than adults' },
        value: { text: ShowRisksAndNeedsUtils.textValue(relationships.emotionalCongruence) },
      },
    ]
  }
}
