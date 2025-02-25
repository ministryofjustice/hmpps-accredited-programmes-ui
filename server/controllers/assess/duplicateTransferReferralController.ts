import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, ReferralService } from '../../services'
import { assessPaths } from '../../paths'

export default class TransferBuildingChoicesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { referralId } = req.params
      TypeUtils.assertHasUser(req)
      const { token: userToken, username } = req.user
      return res.render('referrals/transfer/duplicate', {
        ...sharedPageData,
        backLinkHref: assessPaths.show.personalDetails({ referralId }),
        pageHeading: 'Duplicate referral found',
        pageTitleOverride: 'Duplicate referral found',
        programmeListHref: findPaths.index({}),
        summaryText: `A referral already exists for ${sharedPageData.person.name} to ${sharedPageData.course.displayName} at ${sharedPageData.organisation.name}.`,
      })
    }
  }
}
