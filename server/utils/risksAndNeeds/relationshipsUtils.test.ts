import RelationshipsUtils from './relationshipsUtils'
import { relationshipsFactory } from '../../testutils/factories'

describe('RelationshipsUtils', () => {
  const relationships = relationshipsFactory.build({
    dvEvidence: true,
    perpOfPartnerOrFamily: true,
    relIssuesDetails: 'Relationship details free text.',
    victimFamilyMember: false,
    victimFormerPartner: true,
    victimOfPartnerFamily: false,
  })

  describe('domesticViolenceSummaryListRows', () => {
    it('formats the relationships domestic violence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(RelationshipsUtils.domesticViolenceSummaryListRows(relationships)).toEqual([
        {
          key: { text: '6.7 - Evidence of domestic violence / partner abuse' },
          value: { text: 'Yes' },
        },
        {
          key: { text: '6.7.1.1 - Is the victim a current or former partner?' },
          value: { text: 'Yes' },
        },
        {
          key: { text: '6.7.1.2 - Is the victim a family member?' },
          value: { text: 'No' },
        },
        {
          key: {
            text: '6.7.2.1 - Is the perpetrator a victim of partner or family abuse?',
          },
          value: { text: 'No' },
        },
        {
          key: { text: '6.7.2.2 - Are they the perpetrator of partner or family abuse?' },
          value: { text: 'Yes' },
        },
      ])
    })
  })
})
