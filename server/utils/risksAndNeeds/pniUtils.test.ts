import PniUtils from './pniUtils'
import type { PniScore } from '@accredited-programmes-api'

describe('PniUtils', () => {
  const pniScore: PniScore = {
    NeedsScore: {
      DomainScore: {
        RelationshipDomainScore: {
          individualRelationshipScores: {
            aggressiveControllingBehaviour: 0,
            curRelCloseFamily: 1,
            easilyInfluenced: 2,
            prevExpCloseRel: 3,
          },
          isAllValuesPresent: [],
          overallRelationshipDomainScore: 0,
        },
        SelfManagementDomainScore: {
          individualSelfManagementScores: {
            difficultiesCoping: 0,
            impulsivity: 1,
            problemSolvingSkills: 2,
            temperControl: 3,
          },
          isAllValuesPresent: [],
          overallSelfManagementDomainScore: 1,
        },
        SexDomainScore: {
          individualSexScores: {
            emotionalCongruence: 0,
            isAllValuesPresent: true,
            offenceRelatedSexualInterests: 1,
            sexualPreOccupation: 2,
          },
          overallSexDomainScore: 2,
        },
        ThinkingDomainScore: {
          individualThinkingScores: {
            hostileOrientation: 1,
            proCriminalAttitudes: 2,
          },
          isAllValuesPresent: [],
          overallThinkingDomainScore: 1,
        },
      },
      classification: 'HIGH_NEED',
      overallNeedsScore: 2,
    },
    RiskScore: {
      IndividualRiskScores: {
        ogrs3: 1,
        ospDc: 2,
        ospIic: 3,
        ovp: 4,
        rsr: 5,
        sara: 'MEDIUM',
      },
      classification: 'MEDIUM_RISK',
    },
    assessmentId: 10259424,
    crn: 'X793865',
    prisonNumber: 'ABC1234',
    programmePathway: 'HIGH_INTENSITY_BC',
    validationErrors: [],
  }

  describe('needScoreToString', () => {
    it('returns the string representation of the given score', () => {
      expect(PniUtils.needScoreToString(0)).toBe('Low need')
      expect(PniUtils.needScoreToString(1)).toBe('Medium need')
      expect(PniUtils.needScoreToString(2)).toBe('High need')
      expect(PniUtils.needScoreToString()).toBe('Unknown')
    })
  })

  describe('relationshipsSummaryListRows', () => {
    it('returns the summary list rows for the relationship domain score', () => {
      const rows = PniUtils.relationshipsSummaryListRows(pniScore.NeedsScore.DomainScore.RelationshipDomainScore)

      expect(rows).toEqual([
        {
          key: {
            text: '6.1 - Current relationship with close family',
          },
          value: {
            text: '1',
          },
        },
        {
          key: {
            text: '6.6 - Previous experience of close relationships',
          },
          value: {
            text: '3',
          },
        },
        {
          key: {
            text: '7.3 - Easily influenced by criminal associates',
          },
          value: {
            text: '2',
          },
        },
        {
          key: {
            text: '11.3 - Aggressive or controlling behaviour',
          },
          value: {
            text: '0',
          },
        },
        {
          key: {
            text: 'Relationships result',
          },
          value: {
            text: 'Low need',
          },
        },
      ])
    })
  })

  describe('selfManagementSummaryListRows', () => {
    it('returns the summary list rows for the self-management domain score', () => {
      const rows = PniUtils.selfManagementSummaryListRows(pniScore.NeedsScore.DomainScore.SelfManagementDomainScore)

      expect(rows).toEqual([
        {
          key: {
            text: '11.2 - Impulsivity',
          },
          value: {
            text: '1',
          },
        },
        {
          key: {
            text: '11.4 - Temper control',
          },
          value: {
            text: '3',
          },
        },
        {
          key: {
            text: '11.6 - Problem-solving skills',
          },
          value: {
            text: '2',
          },
        },
        {
          key: {
            text: '10.1 - Difficulties coping',
          },
          value: {
            text: '0',
          },
        },
        {
          key: {
            text: 'Self-management result',
          },
          value: {
            text: 'Medium need',
          },
        },
      ])
    })
  })

  describe('sexSummaryListRows', () => {
    it('returns the summary list rows for the sex domain score', () => {
      const rows = PniUtils.sexSummaryListRows(pniScore.NeedsScore.DomainScore.SexDomainScore)

      expect(rows).toEqual([
        {
          key: {
            text: '11.11 - Sexual Pre-occupation',
          },
          value: {
            text: '2',
          },
        },
        {
          key: {
            text: '11.12 - Offence related Sexual Interests',
          },
          value: {
            text: '1',
          },
        },
        {
          key: {
            text: '6.12 Emotional congruence with children or feeling closer to children than adults',
          },
          value: {
            text: '0',
          },
        },
        {
          key: {
            text: 'Sex result',
          },
          value: {
            text: 'High need',
          },
        },
      ])
    })
  })

  describe('thinkingSummaryListRows', () => {
    it('returns the summary list rows for the thinking domain score', () => {
      const rows = PniUtils.thinkingSummaryListRows(pniScore.NeedsScore.DomainScore.ThinkingDomainScore)

      expect(rows).toEqual([
        {
          key: {
            text: '12.1 Pro-criminal attitudes',
          },
          value: {
            text: '2',
          },
        },
        {
          key: {
            text: '12.9 Hostile orientation',
          },
          value: {
            text: '1',
          },
        },
        {
          key: {
            text: 'Thinking result',
          },
          value: {
            text: 'Medium need',
          },
        },
      ])
    })
  })
})
