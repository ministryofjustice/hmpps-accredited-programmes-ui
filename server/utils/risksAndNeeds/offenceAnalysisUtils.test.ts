import OffenceAnalysisUtils from './offenceAnalysisUtils'
import { offenceDetailFactory } from '../../testutils/factories'

describe('OffenceAnalysisUtils', () => {
  const offenceDetail = offenceDetailFactory.build({
    acceptsResponsibility: true,
    acceptsResponsibilityDetail: 'Detail about the persons acceptance',
    contactTargeting: false,
    domesticViolence: true,
    motivationAndTriggers: 'Detail about motivation and triggers',
    numberOfOthersInvolved: 2,
    offenceDetails: 'Details about the offence',
    othersInvolvedDetail: 'Detail about the others involved',
    patternOffending: 'Detail about the pattern of offending',
    peerGroupInfluences: 'Detail about influences',
    raciallyMotivated: false,
    recognisesImpact: true,
    repeatVictimisation: false,
    revenge: true,
    stalking: false,
    victimWasStranger: true,
  })

  describe('impactAndConsequencesSummaryListRows', () => {
    it('formats the impact and consequences offence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(OffenceAnalysisUtils.impactAndConsequencesSummaryListRows(offenceDetail)).toEqual([
        {
          key: {
            text: 'Does the offender recognise the impact and consequences of offending on victim / community / wider society?',
          },
          value: {
            text: 'Yes',
          },
        },
      ])
    })
  })

  describe('otherOffendersAndInfluencesSummaryListRows', () => {
    it('formats the other offenders and influences offence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(OffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows(offenceDetail)).toEqual([
        {
          key: { text: 'Were there other offenders involved?' },
          value: {
            text: 'Yes',
          },
        },
        {
          key: { text: 'Number of others involved' },
          value: {
            text: '2',
          },
        },
        {
          key: { text: 'Was the offender the leader?' },
          value: {
            text: 'Detail about the others involved',
          },
        },
        {
          key: { text: 'Peer group influences (eg offender easily led, gang member)' },
          value: {
            text: 'Detail about influences',
          },
        },
      ])
    })

    describe('when there were no other offenders involved', () => {
      it('returns "No" for the "Were there other offenders involved?" key', () => {
        expect(
          OffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows(
            offenceDetailFactory.build({ numberOfOthersInvolved: 0 }),
          ),
        ).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Were there other offenders involved?' },
              value: {
                text: 'No',
              },
            },
          ]),
        )
      })
    })

    describe('when `numberOfOthersInvolved` is undefined', () => {
      it('returns "No" for the "Were there other offenders involved?" key', () => {
        expect(
          OffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows(
            offenceDetailFactory.build({ numberOfOthersInvolved: undefined }),
          ),
        ).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Were there other offenders involved?' },
              value: {
                text: 'No',
              },
            },
          ]),
        )
      })
    })
  })

  describe('responsibilitySummaryListRows', () => {
    it('formats the responsibilty related offence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(OffenceAnalysisUtils.responsibilitySummaryListRows(offenceDetail)).toEqual([
        {
          key: { text: 'Does the offender accept responsibility for the current offence(s)?' },
          value: {
            text: 'Yes',
          },
        },
        {
          key: {
            text: 'How much responsibility does the offender acknowledge for the offence(s). Do they blame others, minimise the extent of their offending?',
          },
          value: {
            text: 'Detail about the persons acceptance',
          },
        },
      ])
    })
  })

  describe('victimsAndPartnersSummaryListRows', () => {
    it('formats the victims and partners related offence details in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(OffenceAnalysisUtils.victimsAndPartnersSummaryListRows(offenceDetail)).toEqual([
        {
          key: { text: 'Were there any direct victim(s) eg contact targeting?' },
          value: {
            text: 'No',
          },
        },
        {
          key: {
            text: 'Were any of the victim(s) targeted because of racial motivation or hatred of other identifiable group?',
          },
          value: {
            text: 'No',
          },
        },
        {
          key: { text: 'Response to a specific victim (eg revenge, settling grudges)' },
          value: {
            text: 'Yes',
          },
        },
        {
          key: { text: 'Physical violence towards partner' },
          value: {
            text: 'Yes',
          },
        },
        {
          key: { text: 'Repeat victimisation of the same person' },
          value: {
            text: 'No',
          },
        },
        {
          key: { text: 'Were the victim(s) stranger(s) to the offender?' },
          value: {
            text: 'Yes',
          },
        },
        {
          key: { text: 'Stalking' },
          value: {
            text: 'No',
          },
        },
      ])
    })
  })
})
