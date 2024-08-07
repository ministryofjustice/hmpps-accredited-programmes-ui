import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { PersonService, ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { ReferralStatus, ReferralStatusUppercase } from '@accredited-programmes/models'

const maxLength = 500

export default class UpdateStatusSelectionController {
  constructor(
    private readonly personService: PersonService,
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

      const [referral, statusHistory, confirmationText] = await Promise.all([
        this.referralService.getReferral(username, referralId),
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referralService.getConfirmationText(username, referralId, referralStatusUpdateData.finalStatusDecision, {
          deselectAndKeepOpen: referralStatusUpdateData.initialStatusDecision === 'DESELECTED|OPEN',
          ptUser: req.path.startsWith(assessPathBase.pattern),
        }),
      ])

      const person = await this.personService.getPerson(username, referral.prisonNumber)

      FormUtils.setFieldErrors(req, res, ['reason'])
      FormUtils.setFormValues(req, res)

      return res.render('referrals/updateStatus/selection/show', {
        action: paths.updateStatus.selection.reason.submit({ referralId }),
        backLinkHref: paths.show.statusHistory({ referralId }),
        confirmationText,
        maxLength,
        pageHeading: confirmationText.primaryHeading,
        person,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submitReason(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      let hasErrors = false
      const paths = this.getPaths(req)

      const { referralId } = req.params
      const { referralStatusUpdateData } = req.session
      const reason = req.body.reason?.trim()

      if (referralStatusUpdateData?.referralId !== referralId || !referralStatusUpdateData.finalStatusDecision) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      const finalStatusDecisionCodeData = await this.referenceDataService.getReferralStatusCodeData(
        req.user.username,
        referralStatusUpdateData.finalStatusDecision,
      )

      if (!finalStatusDecisionCodeData.notesOptional && !reason) {
        req.flash('reasonError', 'Enter additional information')
        hasErrors = true
      }

      if (reason?.length > maxLength) {
        req.flash('reasonError', `Additional information must be ${maxLength} characters or fewer`)
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
