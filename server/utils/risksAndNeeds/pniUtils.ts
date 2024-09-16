import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type {
  RelationshipDomainScore,
  SelfManagementDomainScore,
  SexDomainScore,
  ThinkingDomainScore,
} from '@accredited-programmes-api'

export default class PniUtils {
  static needScoreToString(needScore?: number): string {
    switch (needScore) {
      case 0:
        return 'Low need'
      case 1:
        return 'Medium need'
      case 2:
        return 'High need'
      default:
        return 'Unknown'
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
          text: ShowRisksAndNeedsUtils.textValue(
            relationshipDomainScore.individualRelationshipScores.curRelCloseFamily?.toString(),
          ),
        },
      },
      {
        key: {
          text: '6.6 - Previous experience of close relationships',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            relationshipDomainScore.individualRelationshipScores.prevExpCloseRel?.toString(),
          ),
        },
      },
      {
        key: {
          text: '7.3 - Easily influenced by criminal associates',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            relationshipDomainScore.individualRelationshipScores.easilyInfluenced?.toString(),
          ),
        },
      },
      {
        key: {
          text: '11.3 - Aggressive or controlling behaviour',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            relationshipDomainScore.individualRelationshipScores.aggressiveControllingBehaviour?.toString(),
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

  static selfManagementSummaryListRows(
    selfManagementDomainScore: SelfManagementDomainScore,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: {
          text: '11.2 - Impulsivity',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            selfManagementDomainScore.individualSelfManagementScores.impulsivity?.toString(),
          ),
        },
      },
      {
        key: {
          text: '11.4 - Temper control',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            selfManagementDomainScore.individualSelfManagementScores.temperControl?.toString(),
          ),
        },
      },
      {
        key: {
          text: '11.6 - Problem-solving skills',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            selfManagementDomainScore.individualSelfManagementScores.problemSolvingSkills?.toString(),
          ),
        },
      },
      {
        key: {
          text: '10.1 - Difficulties coping',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            selfManagementDomainScore.individualSelfManagementScores.difficultiesCoping?.toString(),
          ),
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
          text: ShowRisksAndNeedsUtils.textValue(sexDomainScore.individualSexScores.sexualPreOccupation?.toString()),
        },
      },
      {
        key: {
          text: '11.12 - Offence related Sexual Interests',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            sexDomainScore.individualSexScores.offenceRelatedSexualInterests?.toString(),
          ),
        },
      },
      {
        key: {
          text: '6.12 Emotional congruence with children or feeling closer to children than adults',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(sexDomainScore.individualSexScores.emotionalCongruence?.toString()),
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
          text: ShowRisksAndNeedsUtils.textValue(
            thinkingDomainScore.individualThinkingScores.proCriminalAttitudes?.toString(),
          ),
        },
      },
      {
        key: {
          text: '12.9 Hostile orientation',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(
            thinkingDomainScore.individualThinkingScores.hostileOrientation?.toString(),
          ),
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
