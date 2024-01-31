import ShowRisksAndNeedsUtils from '../referrals/showRisksAndNeedsUtils'
import type { OffenceDetail } from '@accredited-programmes/api'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'

export default class OffenceAnalysisUtils {
  static impactAndConsequencesSummaryListRows(
    offenceDetail: OffenceDetail,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: {
          text: 'Does the offender recognise the impact and consequences of offending on victim / community / wider society?',
        },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.recognisesImpact),
        },
      },
    ]
  }

  static otherOffendersAndInfluencesSummaryListRows(
    offenceDetail: OffenceDetail,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Were there other offenders involved?' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(
            !!offenceDetail.numberOfOthersInvolved && offenceDetail.numberOfOthersInvolved > 0,
          ),
        },
      },
      {
        key: { text: 'Number of others involved' },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(offenceDetail.numberOfOthersInvolved?.toString()),
        },
      },
      {
        key: { text: 'Was the offender the leader?' },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(offenceDetail.othersInvolvedDetail),
        },
      },
      {
        key: { text: 'Peer group influences (eg offender easily led, gang member)' },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(offenceDetail.peerGroupInfluences),
        },
      },
    ]
  }

  static responsibilitySummaryListRows(
    offenceDetail: OffenceDetail,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Does the offender accept responsibility for the current offence(s)?' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.acceptsResponsibility),
        },
      },
      {
        key: {
          text: 'How much responsibility does the offender acknowledge for the offence(s). Do they blame others, minimise the extent of their offending?',
        },
        value: {
          text: ShowRisksAndNeedsUtils.textValue(offenceDetail.acceptsResponsibilityDetail),
        },
      },
    ]
  }

  static victimsAndPartnersSummaryListRows(
    offenceDetail: OffenceDetail,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Were there any direct victim(s) eg contact targeting?' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.contactTargeting),
        },
      },
      {
        key: {
          text: 'Were any of the victim(s) targeted because of racial motivation or hatred of other identifiable group?',
        },
        value: { text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.raciallyMotivated) },
      },
      {
        key: { text: 'Response to a specific victim (eg revenge, settling grudges)' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.revenge),
        },
      },
      {
        key: { text: 'Physical violence towards partner' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.domesticViolence),
        },
      },
      {
        key: { text: 'Repeat victimisation of the same person' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.repeatVictimisation),
        },
      },
      {
        key: { text: 'Were the victim(s) stranger(s) to the offender?' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.victimWasStranger),
        },
      },
      {
        key: { text: 'Stalking' },
        value: {
          text: ShowRisksAndNeedsUtils.yesOrNo(offenceDetail.stalking),
        },
      },
    ]
  }
}
