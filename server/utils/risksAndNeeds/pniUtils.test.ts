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
          overallRelationshipDomainScore: 0,
        },
        SelfManagementDomainScore: {
          individualSelfManagementScores: {
            difficultiesCoping: 0,
            impulsivity: 1,
            problemSolvingSkills: 2,
            temperControl: 3,
          },
          overallSelfManagementDomainScore: 1,
        },
        SexDomainScore: {
          individualSexScores: {
            emotionalCongruence: 0,
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
          overallThinkingDomainScore: 1,
        },
      },
      classification: 'HIGH_NEED',
      overallNeedsScore: 2,
    },
    RiskScore: {
      IndividualRiskScores: {
        ogrs3: 1,
        ospDc: '2',
        ospIic: '3',
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
      expect(PniUtils.needScoreToString(null)).toBe('Cannot calculate – information missing')
    })
  })

  describe('pathwayContent', () => {
    const personName = 'Del Hatton'
    it('returns the pathway content for the given person name and HIGH_INTENSITY_BC programme pathway', () => {
      const pathwayContent = PniUtils.pathwayContent(personName, 'HIGH_INTENSITY_BC')

      expect(pathwayContent).toEqual({
        bodyText:
          'Based on the risk and need scores, Del Hatton may be eligible for the high intensity Accredited Programmes pathway.',
        class: 'pathway-content--high',
        dataTestId: 'high-intensity-pathway-content',
        headingText: 'High Intensity',
      })
    })

    it('returns the pathway content for the given person name and MODERATE_INTENSITY_BC programme pathway', () => {
      const pathwayContent = PniUtils.pathwayContent(personName, 'MODERATE_INTENSITY_BC')

      expect(pathwayContent).toEqual({
        bodyText:
          'Based on the risk and need scores, Del Hatton may be eligible for the moderate intensity Accredited Programmes pathway.',
        class: 'pathway-content--moderate',
        dataTestId: 'moderate-intensity-pathway-content',
        headingText: 'Moderate Intensity',
      })
    })

    it('returns the pathway content for the given person name and ALTERNATIVE_PATHWAY programme pathway', () => {
      const pathwayContent = PniUtils.pathwayContent(personName, 'ALTERNATIVE_PATHWAY')

      expect(pathwayContent).toEqual({
        bodyText:
          'Based on the risk and need scores, Del Hatton may not be eligible for either the moderate or high intensity Accredited Programmes pathway. Speak to the Offender Management team about other options.',
        class: 'pathway-content--alternative',
        dataTestId: 'alternative-pathway-content',
        headingText: 'Not eligible',
      })
    })

    it('returns the pathway content for the given person name and an unknown programme pathway', () => {
      const pathwayContent = PniUtils.pathwayContent(personName)

      expect(pathwayContent).toEqual({
        bodyText:
          'There is not enough information in the layer 3 assessment to calculate the recommended programme pathway.',
        class: 'pathway-content--missing',
        dataTestId: 'unknown-pathway',
        headingText: 'Information missing',
      })
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

  describe('scoreValueText', () => {
    it('returns the string representation of the given score', () => {
      expect(PniUtils.scoreValueText(0)).toBe('0')
      expect(PniUtils.scoreValueText(null)).toBe('Score missing')
      expect(PniUtils.scoreValueText(undefined)).toBe('Score missing')
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
