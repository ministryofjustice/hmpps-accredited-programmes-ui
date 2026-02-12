import type { Request, Response, TypedRequestHandler } from 'express'

import { referPathBase } from '../../paths'
import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  AlcoholMisuseUtils,
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
import type { RiskLevel } from '@accredited-programmes/models'
import type { RisksAndNeedsSharedPageData } from '@accredited-programmes/ui'

export default class RisksAndNeedsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly oasysService: OasysService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  alcoholMisuse(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const drugAlcoholDetail = await this.withErrorHandling(
        this.oasysService.getDrugAndAlcoholDetails(req.user.username, sharedPageData.referral.prisonNumber),
        res,
      )

      const templateLocals = drugAlcoholDetail
        ? {
            alcoholMisuseSummaryListRows: AlcoholMisuseUtils.summaryListRows(drugAlcoholDetail.alcohol),
            hasData: true,
          }
        : {
            hasData: false,
          }

      return res.render('referrals/show/risksAndNeeds/alcoholMisuse', { ...sharedPageData, ...templateLocals })
    }
  }

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
            criminalAssociatesSummaryListRows: LifestyleAndAssociatesUtils.criminalAssociatesSummaryListRows(lifestyle),
            hasData: true,
            lifestyleIssues: ShowRisksAndNeedsUtils.htmlTextValue(lifestyle.lifestyleIssues),
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
            motivationAndTriggersText: ShowRisksAndNeedsUtils.htmlTextValue(offenceDetails.motivationAndTriggers),
            offenceDetailsText: ShowRisksAndNeedsUtils.htmlTextValue(offenceDetails.offenceDetails),
            otherOffendersAndInfluencesSummaryListRows:
              OffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows(offenceDetails),
            patternOffendingText: ShowRisksAndNeedsUtils.htmlTextValue(offenceDetails.patternOffending),
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
            closeRelationshipsSummaryListRows: RelationshipsUtils.closeRelationshipsSummaryListRows(relationships),
            domesticViolenceSummaryListRows: RelationshipsUtils.domesticViolenceSummaryListRows(relationships),
            familyRelationshipsSummaryListRows: RelationshipsUtils.familyRelationshipsSummaryListRows(relationships),
            hasData: true,
            relIssuesDetails: ShowRisksAndNeedsUtils.htmlTextValue(relationships.relIssuesDetails),
            relationshipToChildrenSummaryListRows:
              RelationshipsUtils.relationshipToChildrenSummaryListRows(relationships),
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

      // const risksAndAlerts = {
      //   assessmentCompleted: '21 January 2026',
      //   dateRetrieved: '01 January 2026',
      //   offenderGroupReconviction: null,
      //   offenderViolencePredictor: null,
      //   imminentRiskOfViolenceTowardsOthers: 'LOW' as RiskLevel,
      //   imminentRiskOfViolenceTowardsPartner: 'LOW' as RiskLevel,
      //   riskOfSeriousRecidivism: null,
      //   overallRoshLevel: 'Very high',
      //   riskPrisonersCustody: null,
      //   riskStaffCustody: null,
      //   riskKnownAdultCustody: null,
      //   riskPublicCustody: null,
      //   riskChildrenCustody: null,
      //   riskStaffCommunity: 'Medium',
      //   riskKnownAdultCommunity: 'High',
      //   riskPublicCommunity: 'Medium',
      //   riskChildrenCommunity: 'Very High',
      //
      //   alerts: [
      //     'Risk to Children',
      //     'Risk to Known Adult',
      //     'Risk to Prisoner',
      //     'Risk to Public',
      //     'Risk to Staff',
      //     'Medium RoSH',
      //   ],
      //   dateRetrieved: '10 February 2026',
      //   lastUpdated: '21 January 2026',
      //   isLegacy: false,
      //   ogrS4Risks: {
      //     allReoffendingScoreType: 'DYNAMIC',
      //     allReoffendingScore: 16.8,
      //     allReoffendingBand: 'Low',
      //     violentReoffendingScoreType: 'DYNAMIC',
      //     violentReoffendingScore: 16.94,
      //     violentReoffendingBand: 'Low',
      //     seriousViolentReoffendingScoreType: 'DYNAMIC',
      //     seriousViolentReoffendingScore: 0.28,
      //     seriousViolentReoffendingBand: 'Low',
      //     directContactSexualReoffendingScore: 74,
      //     directContactSexualReoffendingBand: 'High',
      //     indirectImageContactSexualReoffendingScore: 56,
      //     indirectImageContactSexualReoffendingBand: 'Medium',
      //     combinedSeriousReoffendingScoreType: 'DYNAMIC',
      //     combinedSeriousReoffendingScore: 0.28,
      //     combinedSeriousReoffendingBand: 'Low',
      //   },
      // }
      let templateLocals = {}
      if (risksAndAlerts) {
        if (risksAndAlerts.isLegacy) {
          templateLocals = {
            alertsGroupTables: RisksAndAlertsUtils.alertsGroupTables(risksAndAlerts.alerts),
            hasData: true,
            importedFromNomisText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
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
          return res.render('referrals/show/risksAndNeeds/risksAndAlerts', { ...sharedPageData, ...templateLocals })
        }
        templateLocals = {
          activeAlerts: {
            flags: risksAndAlerts.alerts?.map(alert => ({ description: alert })),
            lastUpdated: `<p class="risk-box__body-text govuk-!-margin-bottom-0">Last updated: ${risksAndAlerts.lastUpdated}</p>`,
          },
          allReoffendingPredictor: RisksAndAlertsUtils.allReoffendingPredictor(risksAndAlerts),
          combinedSeriousReoffendingPredictor: {
            completedDate: risksAndAlerts.lastUpdated,
            level: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.ogrS4Risks?.combinedSeriousReoffendingBand),
            score: risksAndAlerts.ogrS4Risks?.combinedSeriousReoffendingScore,
            staticOrDynamic: risksAndAlerts.ogrS4Risks?.combinedSeriousReoffendingScoreType?.toUpperCase(),
            type: 'Combined serious reoffending predictor',
          },
          directContactSexualReoffendingPredictor: {
            completedDate: risksAndAlerts.lastUpdated,
            level: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.ogrS4Risks?.directContactSexualReoffendingBand),
            score: risksAndAlerts.ogrS4Risks?.directContactSexualReoffendingScore,
            type: 'Direct contact: Sexual reoffending predictor',
          },
          hasData: true,
          imagesAndIndirectContactSexualReoffendingPredictor: {
            completedDate: risksAndAlerts.lastUpdated,
            level: RisksAndAlertsUtils.levelOrUnknownStr(
              risksAndAlerts.ogrS4Risks?.indirectImageContactSexualReoffendingBand,
            ),
            score: risksAndAlerts.ogrS4Risks?.indirectImageContactSexualReoffendingScore,
            type: 'Images and indirect contact: Sexual reoffending predictor',
          },
          importedFromNdeliusText: {
            classes: 'govuk-!-margin-top-8',
            text: `Imported from Nomis on ${risksAndAlerts.dateRetrieved}, last updated on ${sharedPageData.recentCompletedAssessmentDate}`,
          },
          roshRiskSummary: {
            hasBeenCompleted: true,
            lastUpdated: risksAndAlerts.lastUpdated,
            overallRisk: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.overallRoshLevel),
            risks: [
              {
                community: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskChildrenCommunity),
                custody: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskChildrenCustody),
                riskTo: 'Children',
              },
              {
                community: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskPublicCommunity),
                custody: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskPublicCustody),
                riskTo: 'Public',
              },
              {
                community: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskKnownAdultCommunity),
                custody: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskKnownAdultCustody),
                riskTo: 'Known Adult',
              },
              {
                community: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskStaffCommunity),
                custody: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskStaffCustody),
                riskTo: 'Staff',
              },
              {
                community: 'N/A',
                custody: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.riskPrisonersCustody),
                riskTo: 'Prisoners',
              },
            ],
          },
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
          updateWarning: {
            iconFallbackText: 'Warning',
            text: 'Risk predictor tools updated',
          },
          violentReoffendingPredictor: {
            completedDate: risksAndAlerts.lastUpdated,
            level: RisksAndAlertsUtils.levelOrUnknownStr(risksAndAlerts.ogrS4Risks?.violentReoffendingBand),
            score: risksAndAlerts.ogrS4Risks?.violentReoffendingScore,
            staticOrDynamic: risksAndAlerts.ogrS4Risks?.violentReoffendingScoreType?.toUpperCase(),
            type: 'Violent reoffending predictor',
          },
        }
        return res.render('referrals/show/risksAndNeeds/risksAndAlertsOgrs4', { ...sharedPageData, ...templateLocals })
      }
      templateLocals = {
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

    const [assessmentDateInfo, course, person, statusTransitions] = await Promise.all([
      this.withErrorHandling(this.oasysService.getAssessmentDateInfo(username, referral.prisonNumber), res),
      this.courseService.getCourseByOffering(username, referral.offeringId),
      this.personService.getPerson(username, referral.prisonNumber),
      isRefer ? this.referralService.getStatusTransitions(username, referral.id) : undefined,
    ])

    const coursePresenter = CourseUtils.presentCourse(course)

    return {
      buttonMenu: ShowReferralUtils.buttonMenu(course, referral, {
        currentPath: req.path,
        recentCaseListPath: req.session.recentCaseListPath,
      }),
      buttons: ShowReferralUtils.buttons(
        { currentPath: req.path, recentCaseListPath: req.session.recentCaseListPath },
        referral,
        statusTransitions,
      ),
      hideTitleServiceName: true,
      navigationItems: ShowRisksAndNeedsUtils.navigationItems(req.path, referral.id),
      pageHeading: `Referral to ${coursePresenter.displayName}`,
      pageSubHeading: 'Risks and needs',
      pageTitleOverride: `Risks and needs for referral to ${coursePresenter.displayName}`,
      person,
      recentCompletedAssessmentDate: assessmentDateInfo?.recentCompletedAssessmentDate
        ? DateUtils.govukFormattedFullDateString(assessmentDateInfo.recentCompletedAssessmentDate)
        : undefined,
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
