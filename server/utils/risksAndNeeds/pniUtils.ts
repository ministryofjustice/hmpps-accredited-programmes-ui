import type { Person } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type {
  PniScore,
  RelationshipDomainScore,
  SelfManagementDomainScore,
  SexDomainScore,
  ThinkingDomainScore,
} from '@accredited-programmes-api'

export default class PniUtils {
  static needScoreToString(needScore?: number | null): string {
    switch (needScore) {
      case 0:
        return 'Low need'
      case 1:
        return 'Medium need'
      case 2:
        return 'High need'
      default:
        return 'Cannot calculate – information missing'
    }
  }

  static pathwayContent(
    personName: Person['name'],
    programmePathway?: PniScore['programmePathway'],
  ): {
    bodyText: string
    class: string
    dataTestId: string
    headingText: string
  } {
    const bodyTextPrefix = `Based on the risk and need scores, ${personName} may`

    switch (programmePathway) {
      case 'HIGH_INTENSITY_BC':
        return {
          bodyText: `${bodyTextPrefix} be eligible for the high intensity Accredited Programmes pathway.`,
          class: 'pathway-content--high',
          dataTestId: 'high-intensity-pathway-content',
          headingText: 'High Intensity',
        }
      case 'MODERATE_INTENSITY_BC':
        return {
          bodyText: `${bodyTextPrefix} be eligible for the moderate intensity Accredited Programmes pathway.`,
          class: 'pathway-content--moderate',
          dataTestId: 'moderate-intensity-pathway-content',
          headingText: 'Moderate Intensity',
        }
      case 'ALTERNATIVE_PATHWAY':
        return {
          bodyText: `${bodyTextPrefix} not be eligible for either the moderate or high intensity Accredited Programmes pathway. Speak to the Offender Management team about other options.`,
          class: 'pathway-content--alternative',
          dataTestId: 'alternative-pathway-content',
          headingText: 'Not eligible',
        }
      default:
        return {
          bodyText:
            'There is not enough information in the layer 3 assessment to calculate the recommended programme pathway.',
          class: 'pathway-content--missing',
          dataTestId: 'unknown-pathway',
          headingText: 'Information missing',
        }
    }
  }

  static relationshipsSummaryListRows(
    relationshipDomainScore: RelationshipDomainScore,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: {
          text: '6.1 - Current relationship with close family',
        },
        value: {
          text: this.scoreValueText(relationshipDomainScore.individualRelationshipScores.curRelCloseFamily),
        },
      },
      {
        key: {
          text: '6.6 - Previous experience of close relationships',
        },
        value: {
          text: this.scoreValueText(relationshipDomainScore.individualRelationshipScores.prevExpCloseRel),
        },
      },
      {
        key: {
          text: '7.3 - Easily influenced by criminal associates',
        },
        value: {
          text: this.scoreValueText(relationshipDomainScore.individualRelationshipScores.easilyInfluenced),
        },
      },
      {
        key: {
          text: '11.3 - Aggressive or controlling behaviour',
        },
        value: {
          text: this.scoreValueText(
            relationshipDomainScore.individualRelationshipScores.aggressiveControllingBehaviour,
          ),
        },
      },
      {
        key: {
          text: 'Relationships result',
        },
        value: {
          text: this.needScoreToString(relationshipDomainScore.overallRelationshipDomainScore),
        },
      },
    ]
  }

  static scoreValueText(value?: number | null): string {
    return value?.toString() || 'Score missing'
  }

  static selfManagementSummaryListRows(
    selfManagementDomainScore: SelfManagementDomainScore,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: {
          text: '11.2 - Impulsivity',
        },
        value: {
          text: this.scoreValueText(selfManagementDomainScore.individualSelfManagementScores.impulsivity),
        },
      },
      {
        key: {
          text: '11.4 - Temper control',
        },
        value: {
          text: this.scoreValueText(selfManagementDomainScore.individualSelfManagementScores.temperControl),
        },
      },
      {
        key: {
          text: '11.6 - Problem-solving skills',
        },
        value: {
          text: this.scoreValueText(selfManagementDomainScore.individualSelfManagementScores.problemSolvingSkills),
        },
      },
      {
        key: {
          text: '10.1 - Difficulties coping',
        },
        value: {
          text: this.scoreValueText(selfManagementDomainScore.individualSelfManagementScores.difficultiesCoping),
        },
      },
      {
        key: {
          text: 'Self-management result',
        },
        value: {
          text: this.needScoreToString(selfManagementDomainScore.overallSelfManagementDomainScore),
        },
      },
    ]
  }

  static sexSummaryListRows(sexDomainScore: SexDomainScore): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: {
          text: '11.11 - Sexual Pre-occupation',
        },
        value: {
          text: this.scoreValueText(sexDomainScore.individualSexScores.sexualPreOccupation),
        },
      },
      {
        key: {
          text: '11.12 - Offence related Sexual Interests',
        },
        value: {
          text: this.scoreValueText(sexDomainScore.individualSexScores.offenceRelatedSexualInterests),
        },
      },
      {
        key: {
          text: '6.12 Emotional congruence with children or feeling closer to children than adults',
        },
        value: {
          text: this.scoreValueText(sexDomainScore.individualSexScores.emotionalCongruence),
        },
      },
      {
        key: {
          text: 'Sex result',
        },
        value: {
          text: this.needScoreToString(sexDomainScore.overallSexDomainScore),
        },
      },
    ]
  }

  static thinkingSummaryListRows(
    thinkingDomainScore: ThinkingDomainScore,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: {
          text: '12.1 Pro-criminal attitudes',
        },
        value: {
          text: this.scoreValueText(thinkingDomainScore.individualThinkingScores.proCriminalAttitudes),
        },
      },
      {
        key: {
          text: '12.9 Hostile orientation',
        },
        value: {
          text: this.scoreValueText(thinkingDomainScore.individualThinkingScores.hostileOrientation),
        },
      },
      {
        key: {
          text: 'Thinking result',
        },
        value: {
          text: this.needScoreToString(thinkingDomainScore.overallThinkingDomainScore),
        },
      },
    ]
  }
}
