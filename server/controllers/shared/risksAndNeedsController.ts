import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  CourseUtils,
  DateUtils,
  OffenceAnalysisUtils,
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

  offenceAnalysis(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      const offenceDetails = await this.oasysService.getOffenceDetails(
        req.user.username,
        sharedPageData.referral.prisonNumber,
      )

      return res.render('referrals/show/risksAndNeeds/offenceAnalysis', {
        ...sharedPageData,
        impactAndConsequencesSummaryListRows: OffenceAnalysisUtils.impactAndConsequencesSummaryListRows(offenceDetails),
        importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
        motivationAndTriggersText: OffenceAnalysisUtils.textValue(offenceDetails.motivationAndTriggers),
        offenceDetailsText: OffenceAnalysisUtils.textValue(offenceDetails.offenceDetails),
        otherOffendersAndInfluencesSummaryListRows:
          OffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows(offenceDetails),
        patternOffendingText: OffenceAnalysisUtils.textValue(offenceDetails.patternOffending),
        responsibilitySummaryListRows: OffenceAnalysisUtils.responsibilitySummaryListRows(offenceDetails),
        victimsAndPartnersSummaryListRows: OffenceAnalysisUtils.victimsAndPartnersSummaryListRows(offenceDetails),
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
