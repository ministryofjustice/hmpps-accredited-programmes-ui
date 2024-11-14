import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { CourseService, PersonService, PniService, ReferralService } from '../../services'
import { CourseUtils, PniUtils, ShowReferralUtils, TypeUtils } from '../../utils'

export default class PniController {
  constructor(
    private readonly courseService: CourseService,
    private readonly pniService: PniService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { username } = req.user

      const referral = await this.referralService.getReferral(username, referralId)
      const person = await this.personService.getPerson(username, referral.prisonNumber)
      const [course, pni] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.pniService.getPni(username, referral.prisonNumber, { gender: person.gender, savePNI: true }),
      ])

      const coursePresenter = CourseUtils.presentCourse(course)

      let templateLocals: Record<string, unknown> = {
        hasData: false,
      }

      if (pni) {
        const {
          NeedsScore: {
            DomainScore: { RelationshipDomainScore, SelfManagementDomainScore, SexDomainScore, ThinkingDomainScore },
          },
        } = pni

        templateLocals = {
          hasData: true,
          missingInformation: pni?.programmePathway === 'MISSING_INFORMATION',
          relationshipsSummaryListRows: PniUtils.relationshipsSummaryListRows(RelationshipDomainScore),
          selfManagementSummaryListRows: PniUtils.selfManagementSummaryListRows(SelfManagementDomainScore),
          sexSummaryListRows: PniUtils.sexSummaryListRows(SexDomainScore),
          thinkingSummaryListRows: PniUtils.thinkingSummaryListRows(ThinkingDomainScore),
        }
      }

      return res.render('referrals/show/pni/show', {
        buttons: ShowReferralUtils.buttons(
          { currentPath: req.path, recentCaseListPath: req.session.recentCaseListPath },
          referral,
        ),
        pageHeading: `Referral to ${coursePresenter.displayName}`,
        pageSubHeading: 'Programme needs identifier',
        pathwayContent: PniUtils.pathwayContent(person.name, pni?.programmePathway),
        person,
        referral,
        riskScoresHref: assessPaths.show.risksAndNeeds.risksAndAlerts({ referralId }),
        subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'pni', referral.id),
        ...templateLocals,
      })
    }
  }
}
