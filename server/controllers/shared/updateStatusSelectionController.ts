import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { ReferralStatus, ReferralStatusUppercase } from '@accredited-programmes/models'

const maxLength = 100

export default class UpdateStatusSelectionController {
  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const paths = this.getPaths(req)

      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { referralStatusUpdateData } = req.session

      if (referralStatusUpdateData?.referralId !== referralId || !referralStatusUpdateData.finalStatusDecision) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      const [statusHistory, referralStatusRefData] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeData(username, referralStatusUpdateData.finalStatusDecision),
      ])

      const { description, hasConfirmation } = referralStatusRefData

      if (hasConfirmation) {
        FormUtils.setFieldErrors(req, res, ['confirmation'])
      } else {
        FormUtils.setFieldErrors(req, res, ['reason'])
        FormUtils.setFormValues(req, res)
      }

      return res.render('referrals/updateStatus/selection/show', {
        action: hasConfirmation
          ? paths.updateStatus.selection.confirmation.submit({ referralId })
          : paths.updateStatus.selection.reason.submit({ referralId }),
        backLinkHref: '#',
        maxLength,
        pageHeading: `Move referral to ${description.toLowerCase()}`,
        referralStatusRefData,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submitConfirmation(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const paths = this.getPaths(req)

      const { referralId } = req.params
      const { confirmation } = req.body
      const { referralStatusUpdateData } = req.session

      if (referralStatusUpdateData?.referralId !== referralId || !referralStatusUpdateData.finalStatusDecision) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      if (!confirmation) {
        req.flash('confirmationError', 'Select confirmation')

        return res.redirect(paths.updateStatus.selection.show({ referralId }))
      }

      return this.updateReferralStatus(req, res, referralStatusUpdateData.finalStatusDecision)
    }
  }

  submitReason(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      let hasErrors = false
      const paths = this.getPaths(req)

      const { referralId } = req.params
      const { referralStatusUpdateData } = req.session
      const reason = req.body.reason?.trim()

      if (referralStatusUpdateData?.referralId !== referralId || !referralStatusUpdateData.finalStatusDecision) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      if (!reason) {
        req.flash('reasonError', 'Enter a reason')
        hasErrors = true
      }

      if (reason?.length > maxLength) {
        req.flash('reasonError', `Reason must be ${maxLength} characters or less`)
        req.flash('formValues', [JSON.stringify({ reason })])
        hasErrors = true
      }

      if (hasErrors) {
        return res.redirect(paths.updateStatus.selection.show({ referralId }))
      }

      return this.updateReferralStatus(req, res, referralStatusUpdateData.finalStatusDecision, reason)
    }
  }

  private getPaths(req: Request) {
    return req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths
  }

  private async updateReferralStatus(
    req: Request,
    res: Response,
    status: ReferralStatus | ReferralStatusUppercase,
    notes?: string,
  ) {
    TypeUtils.assertHasUser(req)

    const isAssess = req.path.startsWith(assessPathBase.pattern)
    const paths = isAssess ? assessPaths : referPaths

    const { username } = req.user
    const { referralId } = req.params
    const { referralStatusUpdateData } = req.session

    await this.referralService.updateReferralStatus(username, referralId, {
      category: referralStatusUpdateData?.statusCategoryCode,
      notes,
      ptUser: isAssess,
      reason: referralStatusUpdateData?.statusReasonCode,
      status,
    })

    delete req.session.referralStatusUpdateData

    return res.redirect(paths.show.statusHistory({ referralId }))
  }
}
