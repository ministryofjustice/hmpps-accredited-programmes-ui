import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { CourseService, PersonService, PniService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

export default class UpdateStatusDecisionController {
  constructor(
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
    private readonly pniService: PniService,
    private readonly courseService: CourseService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { referralStatusUpdateData } = req.session

      if (referralStatusUpdateData?.referralId !== referralId) {
        delete req.session.referralStatusUpdateData
      }

      const isDeselectAndKeepOpen = this.isDeselectAndKeepOpen(req)

      const [referral, statusHistory, statusTransitionsForReferral, confirmationText] = await Promise.all([
        this.referralService.getReferral(username, referralId),
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referralService.getStatusTransitions(username, referralId, {
          deselectAndKeepOpen: isDeselectAndKeepOpen,
          ptUser: true,
        }),
        isDeselectAndKeepOpen
          ? this.referralService.getConfirmationText(username, referralId, 'DESELECTED', {
              deselectAndKeepOpen: true,
              ptUser: true,
            })
          : {
              primaryDescription: 'Record all decisions to keep the status up to date.',
              primaryHeading: 'Update referral status',
              secondaryDescription: null,
              secondaryHeading: 'Select decision',
            },
      ])

      const person = await this.personService.getPerson(username, referral.prisonNumber)

      const statusTransitions = statusTransitionsForReferral.map(statusTransition => {
        if (statusTransition.deselectAndKeepOpen) {
          return {
            ...statusTransition,
            code: `${statusTransition.code}|OPEN`,
          }
        }
        return statusTransition
      })

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        statusTransitions,
        isDeselectAndKeepOpen
          ? req.session.referralStatusUpdateData?.finalStatusDecision
          : req.session.referralStatusUpdateData?.initialStatusDecision,
      )

      FormUtils.setFieldErrors(req, res, ['statusDecision'])

      return res.render('referrals/updateStatus/decision/show', {
        backLinkHref: assessPaths.show.statusHistory({ referralId }),
        confirmationText,
        pageHeading: confirmationText.primaryHeading,
        person,
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { statusDecision } = req.body as { statusDecision: Uppercase<string> }
      const { referralStatusUpdateData } = req.session
      const isDeselectAndKeepOpen = this.isDeselectAndKeepOpen(req)

      if (!statusDecision) {
        req.flash('statusDecisionError', 'Select a status decision')

        return res.redirect(assessPaths.updateStatus.decision.show({ referralId }))
      }

      const splitStatusDecision = statusDecision.split('|')
      const statusDecisionValue = splitStatusDecision[0] as ReferralStatusUppercase
      let needsReason = ['DESELECTED', 'WITHDRAWN'].includes(statusDecisionValue)

      req.session.referralStatusUpdateData = {
        decisionForCategoryAndReason: statusDecisionValue,
        initialStatusDecision: statusDecision,
        ...(isDeselectAndKeepOpen ? referralStatusUpdateData : {}),
        finalStatusDecision: statusDecisionValue,
        referralId,
      }

      if (statusDecisionValue === 'ASSESSED_SUITABLE' && !isDeselectAndKeepOpen) {
        const pathways = await this.referralService.getPathways(req.user.username, referralId)
        needsReason = ReferralUtils.checkIfOverride(pathways.recommended, pathways.requested)
      }

      if (needsReason) {
        return res.redirect(assessPaths.updateStatus.reason.show({ referralId }))
      }

      return res.redirect(assessPaths.updateStatus.selection.show({ referralId }))
    }
  }

  private isDeselectAndKeepOpen(req: Request) {
    return (
      req.query.deselectAndKeepOpen === 'true' &&
      req.session.referralStatusUpdateData?.initialStatusDecision === 'DESELECTED|OPEN'
    )
  }
}
