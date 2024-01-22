import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  CourseUtils,
  DateUtils,
  LifestyleAndAssociatesUtils,
  OffenceAnalysisUtils,
  RelationshipsUtils,
  RoshAnalysisUtils,
  ShowReferralUtils,
  ShowRisksAndNeedsUtils,
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
