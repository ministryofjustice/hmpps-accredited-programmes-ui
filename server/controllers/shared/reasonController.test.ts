import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import ReasonController from './reasonController'
import type { ReferralStatusUpdateSessionData } from '../../@types/express'
import { assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { referralFactory, referralStatusHistoryFactory, referralStatusReasonFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ReferralUtils, ShowReferralUtils } from '../../utils'
import type { Referral, ReferralStatusReason } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { GovukFrontendRadiosItem } from '@govuk-frontend'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/referralUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockReferralUtils = ReferralUtils as jest.Mocked<typeof ReferralUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('ReasonController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referenceDataService = createMock<ReferenceDataService>({})
  const referralService = createMock<ReferralService>({})

  const radioItems: Array<GovukFrontendRadiosItem> = [
    { text: 'Reason A', value: 'STATUS-REASON-A' },
    { text: 'Reason B', value: 'STATUS-REASON-B' },
  ]
  const timelineItems: Array<MojTimelineItem> = [
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral submitted' },
    },
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral started' },
    },
  ]
  let referral: Referral
  let referralStatusCodeReasons: Array<ReferralStatusReason>
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>
  let referralStatusUpdateData: ReferralStatusUpdateSessionData

  let controller: ReasonController

  beforeEach(() => {
    referral = referralFactory.submitted().build({})
    referralStatusCodeReasons = referralStatusReasonFactory.buildList(2, { referralCategoryCode: 'A' })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    referralStatusUpdateData = {
      decisionForCategoryAndReason: 'DESELECTED',
      finalStatusDecision: 'ASSESSED_SUITABLE',
      initialStatusDecision: 'ANOTHER_STATUS',
      referralId: referral.id,
      statusCategoryCode: 'STATUS-CAT-A',
    }
    mockReferralUtils.statusOptionsToRadioItems.mockReturnValue(radioItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referenceDataService.getReferralStatusCodeReasons.mockResolvedValue(referralStatusCodeReasons)

    controller = new ReasonController(referenceDataService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.updateStatus.reason.show({ referralId: referral.id }),
      session: { referralStatusUpdateData },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/reason/show', {
        backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
        pageDescription: 'Deselecting someone means they cannot continue the programme. The referral will be closed.',
        pageHeading: 'Deselection reason',
        radioItems,
        radioLegend: 'Choose the deselection reason',

        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referenceDataService.getReferralStatusCodeReasons).toHaveBeenCalledWith(
        username,
        'STATUS-CAT-A',
        'DESELECTED',
      )
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonCode'])
      expect(ReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusCodeReasons, undefined)
      expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
    })

    describe('when the request path is on the assess journey', () => {
      it('should render the show template with the correct response locals', async () => {
        request.path = assessPaths.updateStatus.reason.show({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/updateStatus/reason/show',
          expect.objectContaining({
            backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
          }),
        )
      })
    })

    describe('when `referralStatusUpdateData.decisionForCategoryAndReason` is `WITHDRAWN', () => {
      it('should render the show template with the correct response locals', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          decisionForCategoryAndReason: 'WITHDRAWN',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/reason/show', {
          backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
          pageDescription: 'If you withdraw the referral, it will be closed.',
          pageHeading: 'Withdrawal reason',
          radioItems,
          radioLegend: 'Select the reason for this withdrawal',
          timelineItems: timelineItems.slice(0, 1),
        })

        expect(referenceDataService.getReferralStatusCodeReasons).toHaveBeenCalledWith(
          username,
          'STATUS-CAT-A',
          'WITHDRAWN',
        )
        expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonCode'])
        expect(ReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusCodeReasons, undefined)
        expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
      })
    })

    describe('when there is  no `referralStatusUpdateData`', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData.referralId` is for a different referral', () => {
      it('should redirect to the status history page', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          referralId: 'ANOTHER-REFERRAL',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when there is no `referralStatusUpdateData.decisionForCategoryAndReason` value', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData?.decisionForCategoryAndReason

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData.decisionForCategoryAndReason` does not require a category selection', () => {
      it('should redirect to the status history page', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          decisionForCategoryAndReason: 'AWAITING_ASSESSMENT',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when there are no reasons for the provided category and status', () => {
      beforeEach(() => {
        referenceDataService.getReferralStatusCodeReasons.mockResolvedValue([])
      })

      it('should redirect to the selection page and set `statusReasonCode` to `undefined` ', async () => {
        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          ...referralStatusUpdateData,
          statusReasonCode: undefined,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })

      describe('and the initialStatusDecision is `DESELECTED|OPEN`', () => {
        it('should redirect to the decision show page with a `deselectAndKeepOpen` query param set to `true`', async () => {
          request.session.referralStatusUpdateData = {
            ...referralStatusUpdateData,
            initialStatusDecision: 'DESELECTED|OPEN',
          }
          referenceDataService.getReferralStatusCodeReasons.mockResolvedValue([])

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.redirect).toHaveBeenCalledWith(
            `${assessPaths.updateStatus.decision.show({ referralId: referral.id })}?deselectAndKeepOpen=true`,
          )
        })
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      request.body = { reasonCode: 'STATUS-REASON-A' }
    })

    it('should update `referralStatusUpdateData` and redirect to refer selection page', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        ...referralStatusUpdateData,
        statusReasonCode: 'STATUS-REASON-A',
      })
      expect(response.redirect).toHaveBeenCalledWith(
        referPaths.updateStatus.selection.show({ referralId: referral.id }),
      )
    })

    describe('when submitting the form on the assess journey', () => {
      it('should update `referralStatusUpdateData` and redirect to the assess selection page', async () => {
        request.path = assessPaths.updateStatus.reason.show({ referralId: referral.id })

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          ...referralStatusUpdateData,
          statusReasonCode: 'STATUS-REASON-A',
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })
    })

    describe('when there is no `referralStatusUpdateData`', () => {
      it('should redirect to the select category page', async () => {
        delete request.session.referralStatusUpdateData

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.updateStatus.category.show({ referralId: referral.id }),
        )
      })
    })

    describe('when there is no `referralStatusUpdateData.statusCategoryCode` value', () => {
      it('should redirect to the select category page', async () => {
        delete request.session.referralStatusUpdateData?.statusCategoryCode

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.updateStatus.category.show({ referralId: referral.id }),
        )
      })
    })

    describe('when there is no `reasonCode` value is in the request body', () => {
      it('should redirect back to the reason show page with a flash message', async () => {
        request.body = { reasonCode: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.updateStatus.reason.show({ referralId: referral.id }))
        expect(request.flash).toHaveBeenCalledWith('reasonCodeError', 'Select a reason')
      })
    })

    describe('when the initialStatusDecision is `DESELECTED|OPEN`', () => {
      it('should redirect to the decision show page with a `deselectAndKeepOpen` query param set to `true`', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          initialStatusDecision: 'DESELECTED|OPEN',
        }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          `${assessPaths.updateStatus.decision.show({ referralId: referral.id })}?deselectAndKeepOpen=true`,
        )
      })
    })
  })
})
