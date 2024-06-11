import type { Request, Response, TypedRequestHandler } from 'express'

import { referPathBase } from '../../paths'
import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  AttitudesUtils,
  CourseUtils,
  DateUtils,
  DrugMisuseUtils,
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

      const attitude = await this.withErrorHandling(
        this.oasysService.getAttitude(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = attitude
        ? {
            attitudesSummaryListRows: AttitudesUtils.attitudesSummaryListRows(attitude),
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          }
        : {
            hasData: false,
          }

      return res.render('referrals/show/risksAndNeeds/attitudes', { ...sharedPageData, ...templateLocals })
    }
  }

  drugMisuse(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const drugAlcoholDetail = await this.withErrorHandling(
        this.oasysService.getDrugAndAlcoholDetails(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = drugAlcoholDetail
        ? {
            drugMisuseSummaryListRows: DrugMisuseUtils.summaryListRows(drugAlcoholDetail.drug),
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          }
        : {
            hasData: false,
          }

      return res.render('referrals/show/risksAndNeeds/drugMisuse', { ...sharedPageData, ...templateLocals })
    }
  }

  emotionalWellbeing(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const psychiatric = await this.withErrorHandling(
        this.oasysService.getPsychiatric(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = psychiatric
        ? {
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            psychiatricSummaryListRows: EmotionalWellbeingUtils.psychiatricSummaryListRows(psychiatric),
          }
        : {
            hasData: false,
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

      const health = await this.withErrorHandling(
        this.oasysService.getHealth(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = health
        ? {
            hasData: true,
            healthSummaryListRows: HealthUtils.healthSummaryListRows(health),
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          }
        : {
            hasData: false,
          }

      return res.render('referrals/show/risksAndNeeds/health', { ...sharedPageData, ...templateLocals })
    }
  }

  learningNeeds(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const learningNeeds = await this.withErrorHandling(
        this.oasysService.getLearningNeeds(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = learningNeeds
        ? {
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            informationSummaryListRows: LearningNeedsUtils.informationSummaryListRows(learningNeeds),
            scoreSummaryListRows: LearningNeedsUtils.scoreSummaryListRows(learningNeeds),
          }
        : {
            hasData: false,
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

      const lifestyle = await this.withErrorHandling(
        this.oasysService.getLifestyle(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = lifestyle
        ? {
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            lifestyleIssues: ShowRisksAndNeedsUtils.textValue(lifestyle.lifestyleIssues),
            reoffendingSummaryListRows: LifestyleAndAssociatesUtils.reoffendingSummaryListRows(lifestyle),
          }
        : {
            hasData: false,
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

      const offenceDetails = await this.withErrorHandling(
        this.oasysService.getOffenceDetails(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = offenceDetails
        ? {
            hasData: true,
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
            hasData: false,
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

      const relationships = await this.withErrorHandling(
        this.oasysService.getRelationships(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = relationships
        ? {
            domesticViolenceSummaryListRows: RelationshipsUtils.domesticViolenceSummaryListRows(relationships),
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            relIssuesDetails: ShowRisksAndNeedsUtils.textValue(relationships.relIssuesDetails),
          }
        : {
            hasData: false,
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

      const risksAndAlerts = await this.withErrorHandling(
        this.oasysService.getRisksAndAlerts(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = risksAndAlerts
        ? {
            alertsGroupTables: RisksAndAlertsUtils.alertsGroupTables(risksAndAlerts.alerts),
            hasData: true,
            importedFromNomisText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            ogrsYear1Box: RisksAndAlertsUtils.riskBox(
              'OGRS Year 1',
              risksAndAlerts.ogrsRisk,
              risksAndAlerts.ogrsYear1 ? `${risksAndAlerts.ogrsYear1}%` : undefined,
            ),
            ogrsYear2Box: RisksAndAlertsUtils.riskBox(
              'OGRS Year 2',
              risksAndAlerts.ogrsRisk,
              risksAndAlerts.ogrsYear2 ? `${risksAndAlerts.ogrsYear2}%` : undefined,
            ),
            ospcBox: RisksAndAlertsUtils.ospBox('OSP/C', risksAndAlerts.ospcScore),
            ospiBox: RisksAndAlertsUtils.ospBox('OSP/I', risksAndAlerts.ospiScore),
            ovpYear1Box: RisksAndAlertsUtils.riskBox(
              'OVP Year 1',
              risksAndAlerts.ovpRisk,
              risksAndAlerts.ovpYear1 ? `${risksAndAlerts.ovpYear1}%` : undefined,
            ),
            ovpYear2Box: RisksAndAlertsUtils.riskBox(
              'OVP Year 2',
              risksAndAlerts.ovpRisk,
              risksAndAlerts.ovpYear2 ? `${risksAndAlerts.ovpYear2}%` : undefined,
            ),
            roshBox: RisksAndAlertsUtils.riskBox('RoSH', risksAndAlerts.overallRoshLevel),
            roshTable: RisksAndAlertsUtils.roshTable(risksAndAlerts),
            rsrBox: RisksAndAlertsUtils.riskBox('RSR', risksAndAlerts.rsrRisk, risksAndAlerts.rsrScore?.toString()),
            saraOthersBox: RisksAndAlertsUtils.riskBox(
              'SARA',
              risksAndAlerts.imminentRiskOfViolenceTowardsOthers,
              undefined,
              'sara-others',
            ),
            saraPartnerBox: RisksAndAlertsUtils.riskBox(
              'SARA',
              risksAndAlerts.imminentRiskOfViolenceTowardsPartner,
              undefined,
              'sara-partner',
            ),
          }
        : {
            hasData: false,
          }

      return res.render('referrals/show/risksAndNeeds/risksAndAlerts', { ...sharedPageData, ...templateLocals })
    }
  }

  roshAnalysis(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const roshAnalysis = await this.withErrorHandling(
        this.oasysService.getRoshAnalysis(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = roshAnalysis
        ? {
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            previousBehaviourSummaryListRows: RoshAnalysisUtils.previousBehaviourSummaryListRows(roshAnalysis),
          }
        : {
            hasData: false,
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

      const behaviour = await this.withErrorHandling(
        this.oasysService.getBehaviour(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = behaviour
        ? {
            hasData: true,
            importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
            thinkingAndBehavingSummaryListRows: ThinkingAndBehavingUtils.thinkingAndBehavingSummaryListRows(behaviour),
          }
        : {
            hasData: false,
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
    const isRefer = req.path.startsWith(referPathBase.pattern)

    const referral = await this.referralService.getReferral(username, referralId)

    const [course, person, statusTransitions] = await Promise.all([
      this.courseService.getCourseByOffering(username, referral.offeringId),
      this.personService.getPerson(username, referral.prisonNumber),
      isRefer ? this.referralService.getStatusTransitions(username, referral.id) : undefined,
    ])

    const coursePresenter = CourseUtils.presentCourse(course)

    return {
      buttons: ShowReferralUtils.buttons(req.path, referral, statusTransitions),
      navigationItems: ShowRisksAndNeedsUtils.navigationItems(req.path, referral.id),
      pageHeading: `Referral to ${coursePresenter.displayName}`,
      pageSubHeading: 'Risks and needs',
      person,
      referral,
      subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'risksAndNeeds', referral.id),
    }
  }

  private async withErrorHandling<T>(fn: Promise<T>, res: Response): Promise<T | null> {
    try {
      return await fn
    } catch (error) {
      res.locals.oasysNomisErrorMessage =
        'We cannot retrieve this information from OASys or NOMIS at the moment. Try again later.'

      return null
    }
  }
}
