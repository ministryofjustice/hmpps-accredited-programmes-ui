import RelationshipsUtils from './relationshipsUtils'
import { relationshipsFactory } from '../../testutils/factories'

describe('RelationshipsUtils', () => {
  const relationships = relationshipsFactory.build({
    dvEvidence: true,
    emotionalCongruence: '1-Some problems',
    perpOfPartnerOrFamily: true,
    prevCloseRelationships: '2-Significant problems',
    relCloseFamily: '0-No problems',
    relIssuesDetails: 'Relationship details free text.',
    victimFamilyMember: false,
    victimFormerPartner: true,
    victimOfPartnerFamily: false,
  })

  describe('closeRelationshipsSummaryListRows', () => {
    it('formats the close relationships details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(RelationshipsUtils.closeRelationshipsSummaryListRows(relationships)).toEqual([
        {
          key: { text: 'Previous experience of close relationships' },
          value: { text: '2-Significant problems' },
        },
      ])
    })
  })

  describe('domesticViolenceSummaryListRows', () => {
    it('formats the relationships domestic violence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(RelationshipsUtils.domesticViolenceSummaryListRows(relationships)).toEqual([
        {
          key: { text: 'Evidence of domestic violence or partner abuse' },
          value: { text: 'Yes' },
        },
        {
          key: { text: 'Is the victim a current or former partner?' },
          value: { text: 'Yes' },
        },
        {
          key: { text: 'Is the victim a family member?' },
          value: { text: 'No' },
        },
        {
          key: {
            text: 'Is the perpetrator a victim of partner or family abuse?',
          },
          value: { text: 'No' },
        },
        {
          key: { text: 'Are they the perpetrator of partner or family abuse?' },
          value: { text: 'Yes' },
        },
      ])
    })
  })

  describe('familyRelationshipsSummaryListRows', () => {
    it('formats the family relationships details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(RelationshipsUtils.familyRelationshipsSummaryListRows(relationships)).toEqual([
        {
          key: { text: 'Current relationship with close family members' },
          value: { text: '0-No problems' },
        },
      ])
    })
  })

  describe('relationshipToChildrenSummaryListRows', () => {
    it('formats the relationship to children details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(RelationshipsUtils.relationshipToChildrenSummaryListRows(relationships)).toEqual([
        {
          key: { text: 'Emotional congruence with children, or feeling closer to children than adults' },
          value: { text: '1-Some problems' },
        },
      ])
    })
  })
})
