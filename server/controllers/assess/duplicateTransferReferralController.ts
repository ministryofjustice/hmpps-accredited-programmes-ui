import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths, referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../services'
import { CourseUtils, ShowReferralUtils, TypeUtils } from '../../utils'

export default class DuplicateTransferReferralController {
  constructor(
    private readonly courseService: CourseService,
    private readonly referralService: ReferralService,
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
    private readonly userService: UserService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { referralId } = req.params
      TypeUtils.assertHasUser(req)
      const { token: userToken, username } = req.user
      const referral = await this.referralService.getReferral(username, referralId)
      const [course, person, offering, referrerUserFullName, referrerEmailAddress] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.personService.getPerson(username, referral.prisonNumber),
        this.courseService.getOffering(username, referral.offeringId),
        this.userService.getFullNameFromUsername(userToken, referral.referrerUsername),
        this.userService.getEmailFromUsername(userToken, referral.referrerUsername),
      ])

      const organisation = await this.organisationService.getOrganisation(userToken, offering.organisationId)
      const coursePresenter = CourseUtils.presentCourse(course)

      return res.render('referrals/transfer/duplicate', {
        backLinkHref: assessPaths.show.personalDetails({ referralId }),
        cancelHref: assessPaths.show.programmeHistory({ referralId }),
        courseOfferingSummaryListRows: ShowReferralUtils.courseOfferingSummaryListRows(
          person.name,
          coursePresenter,
          offering.contactEmail,
          organisation.name,
        ),
        pageHeading: 'Duplicate referral found',
        pageTitleOverride: 'Duplicate referral found',
        submissionSummaryListRows: ShowReferralUtils.submissionSummaryListRows(
          referral.submittedOn,
          referrerUserFullName,
          referrerEmailAddress,
          referral.primaryPrisonOffenderManager,
        ),
        summaryText: `A referral already exists for ${person.name} to ${course.displayName} at ${organisation.name}.`,
        withdrawButtonText: `Withdraw referral to ${course.displayName}`,
        withdrawHref: assessPaths.updateStatus.reason.show({ referralId }),
      })
    }
  }

  withdraw(): TypedRequestHandler<Request, Response> {
    return (req: Request, res: Response) => {
      const { referralId } = req.params
      const withdrawStatus = 'WITHDRAWN'

      req.session.referralStatusUpdateData = {
        decisionForCategoryAndReason: withdrawStatus,
        finalStatusDecision: withdrawStatus,
        initialStatusDecision: withdrawStatus,
        referralId,
      }

      return res.redirect(referPaths.updateStatus.reason.show({ referralId }))
    }
  }
}
