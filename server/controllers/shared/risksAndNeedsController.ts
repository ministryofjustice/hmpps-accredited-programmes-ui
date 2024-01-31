import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  AttitudesUtils,
  CourseUtils,
  DateUtils,
  EmotionalWellbeingUtils,
  HealthUtils,
  LearningNeedsUtils,
  LifestyleAndAssociatesUtils,
  OffenceAnalysisUtils,
  RelationshipsUtils,
  RisksAndAlertsUtils,
  RoshAnalysisUtils,
  ShowReferralUtils,
  ShowRisksAndNeedsUtils,
  ThinkingAndBehavingUtils,
  TypeUtils,
} from '../../utils'
import type { RisksAndNeedsSharedPageData } from '@accredited-programmes/ui'

export default class RisksAndNeedsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly oasysService: OasysService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  attitudes(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const attitude = await this.oasysService.getAttitude(req.user.username, sharedPageData.referral.prisonNumber)

      const templateLocals = attitude
        ? {
            attitudesSummaryListRows: AttitudesUtils.attitudesSummaryListRows(attitude),
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            noAttitude: true,
          }
        : {
            noAttitude: false,
          }

      return res.render('referrals/show/risksAndNeeds/attitudes', { ...sharedPageData, ...templateLocals })
    }
  }

  emotionalWellbeing(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const psychiatric = await this.oasysService.getPsychiatric(
        req.user.username,
        sharedPageData.referral.prisonNumber,
      )

      const templateLocals = psychiatric
        ? {
            hasEmotionalWellbeingData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            psychiatricSummaryListRows: EmotionalWellbeingUtils.psychiatricSummaryListRows(psychiatric),
          }
        : {
            hasEmotionalWellbeingData: false,
          }

      return res.render('referrals/show/risksAndNeeds/emotionalWellbeing', {
        ...sharedPageData,
        ...templateLocals,
      })
    }
  }

  health(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const health = await this.oasysService.getHealth(req.user.username, sharedPageData.referral.prisonNumber)

      const templateLocals = health
        ? {
            hasHealthData: true,
            healthSummaryListRows: HealthUtils.healthSummaryListRows(health),
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          }
        : {
            hasHealthData: false,
          }

      return res.render('referrals/show/risksAndNeeds/health', { ...sharedPageData, ...templateLocals })
    }
  }

  learningNeeds(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const learningNeeds = await this.oasysService.getLearningNeeds(
        req.user.username,
        sharedPageData.referral.prisonNumber,
      )

      const templateLocals = learningNeeds
        ? {
            hasLearningNeeds: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            informationSummaryListRows: LearningNeedsUtils.informationSummaryListRows(learningNeeds),
            scoreSummaryListRows: LearningNeedsUtils.scoreSummaryListRows(learningNeeds),
          }
        : {
            hasLearningNeeds: false,
          }

      return res.render('referrals/show/risksAndNeeds/learningNeeds', {
        ...sharedPageData,
        ...templateLocals,
      })
    }
  }

  lifestyleAndAssociates(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const lifestyle = await this.oasysService.getLifestyle(req.user.username, sharedPageData.referral.prisonNumber)

      const templateLocals = lifestyle
        ? {
            hasLifestyle: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            reoffendingSummaryListRows: LifestyleAndAssociatesUtils.reoffendingSummaryListRows(lifestyle),
          }
        : {
            hasLifestyle: false,
          }

      return res.render('referrals/show/risksAndNeeds/lifestyleAndAssociates', {
        ...sharedPageData,
        ...templateLocals,
      })
    }
  }

  offenceAnalysis(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const offenceDetails = await this.oasysService.getOffenceDetails(
        req.user.username,
        sharedPageData.referral.prisonNumber,
      )

      const templateLocals = offenceDetails
        ? {
            hasOffenceDetails: true,
            impactAndConsequencesSummaryListRows:
              OffenceAnalysisUtils.impactAndConsequencesSummaryListRows(offenceDetails),
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            motivationAndTriggersText: ShowRisksAndNeedsUtils.textValue(offenceDetails.motivationAndTriggers),
            offenceDetailsText: ShowRisksAndNeedsUtils.textValue(offenceDetails.offenceDetails),
            otherOffendersAndInfluencesSummaryListRows:
              OffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows(offenceDetails),
            patternOffendingText: ShowRisksAndNeedsUtils.textValue(offenceDetails.patternOffending),
            responsibilitySummaryListRows: OffenceAnalysisUtils.responsibilitySummaryListRows(offenceDetails),
            victimsAndPartnersSummaryListRows: OffenceAnalysisUtils.victimsAndPartnersSummaryListRows(offenceDetails),
          }
        : {
            hasOffenceDetails: false,
          }

      return res.render('referrals/show/risksAndNeeds/offenceAnalysis', {
        ...sharedPageData,
        ...templateLocals,
      })
    }
  }

  relationships(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const relationships = await this.oasysService.getRelationships(
        req.user.username,
        sharedPageData.referral.prisonNumber,
      )

      const templateLocals = relationships
        ? {
            domesticViolenceSummaryListRows: RelationshipsUtils.domesticViolenceSummaryListRows(relationships),
            hasRelationships: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          }
        : {
            hasRelationships: false,
          }

      return res.render('referrals/show/risksAndNeeds/relationships', {
        ...sharedPageData,
        ...templateLocals,
      })
    }
  }

  risksAndAlerts(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const risks = await this.oasysService.getRisks(req.user.username, sharedPageData.referral.prisonNumber)

      const templateLocals = risks
        ? {
            alerts: risks.alerts,
            hasRisks: true,
            importedFromNomisText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
            importedFromOasysText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            ogrsYear1Box: RisksAndAlertsUtils.riskBox(
              'OGRS Year 1',
              risks.ogrsRisk,
              risks.ogrsYear1 ? `${risks.ogrsYear1}%` : undefined,
            ),
            ogrsYear2Box: RisksAndAlertsUtils.riskBox(
              'OGRS Year 2',
              risks.ogrsRisk,
              risks.ogrsYear2 ? `${risks.ogrsYear2}%` : undefined,
            ),
            ospcBox: RisksAndAlertsUtils.ospBox('OSP/C', risks.ospcScore),
            ospiBox: RisksAndAlertsUtils.ospBox('OSP/I', risks.ospiScore),
            ovpYear1Box: RisksAndAlertsUtils.riskBox(
              'OVP Year 1',
              risks.ovpRisk,
              risks.ovpYear1 ? `${risks.ovpYear1}%` : undefined,
            ),
            ovpYear2Box: RisksAndAlertsUtils.riskBox(
              'OVP Year 2',
              risks.ovpRisk,
              risks.ovpYear2 ? `${risks.ovpYear2}%` : undefined,
            ),
            roshBox: RisksAndAlertsUtils.riskBox('RoSH', risks.overallRoshLevel),
            roshTable: RisksAndAlertsUtils.roshTable(risks),
            rsrBox: RisksAndAlertsUtils.riskBox('RSR', risks.rsrRisk, risks.rsrScore?.toString()),
            saraOthersBox: RisksAndAlertsUtils.riskBox(
              'SARA',
              risks.imminentRiskOfViolenceTowardsOthers,
              undefined,
              'sara-others',
            ),
            saraPartnerBox: RisksAndAlertsUtils.riskBox(
              'SARA',
              risks.imminentRiskOfViolenceTowardsPartner,
              undefined,
              'sara-partner',
            ),
          }
        : {
            hasRisks: false,
          }

      return res.render('referrals/show/risksAndNeeds/risksAndAlerts', { ...sharedPageData, ...templateLocals })
    }
  }

  roshAnalysis(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const roshAnalysis = await this.oasysService.getRoshAnalysis(
        req.user.username,
        sharedPageData.referral.prisonNumber,
      )

      const templateLocals = roshAnalysis
        ? {
            hasRoshAnalysis: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            previousBehaviourSummaryListRows: RoshAnalysisUtils.previousBehaviourSummaryListRows(roshAnalysis),
          }
        : {
            hasRoshAnalysis: false,
          }

      return res.render('referrals/show/risksAndNeeds/roshAnalysis', {
        ...sharedPageData,
        ...templateLocals,
      })
    }
  }

  thinkingAndBehaving(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const behaviour = await this.oasysService.getBehaviour(req.user.username, sharedPageData.referral.prisonNumber)

      const templateLocals = behaviour
        ? {
            hasBehaviourData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            thinkingAndBehavingSummaryListRows: ThinkingAndBehavingUtils.thinkingAndBehavingSummaryListRows(behaviour),
          }
        : {
            hasBehaviourData: false,
          }

      return res.render('referrals/show/risksAndNeeds/thinkingAndBehaving', {
        ...sharedPageData,
        ...templateLocals,
      })
    }
  }

  private async sharedPageData(req: Request, res: Response): Promise<RisksAndNeedsSharedPageData> {
    TypeUtils.assertHasUser(req)

    const { referralId } = req.params
    const { username } = req.user

    const referral = await this.referralService.getReferral(username, referralId)

    const [course, person] = await Promise.all([
      this.courseService.getCourseByOffering(username, referral.offeringId),
      this.personService.getPerson(username, referral.prisonNumber, res.locals.user.caseloads),
    ])

    const coursePresenter = CourseUtils.presentCourse(course)

    return {
      navigationItems: ShowRisksAndNeedsUtils.navigationItems(req.path, referral.id),
      pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
      pageSubHeading: 'Risks and needs',
      person,
      referral,
      subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'risksAndNeeds', referral.id),
    }
  }
}
