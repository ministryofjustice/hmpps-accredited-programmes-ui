import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import UpdateStatusDecisionController from './updateStatusDecisionController'
import type { ReferralStatusUpdateSessionData } from '../../@types/express'
import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { referralFactory, referralStatusHistoryFactory, referralStatusRefDataFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ReferralUtils, ShowReferralUtils } from '../../utils'
import type { Referral, ReferralStatusRefData } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { GovukFrontendRadiosItem } from '@govuk-frontend'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/referralUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockedFormUtils = FormUtils as jest.Mocked<typeof FormUtils>
const mockReferralUtils = ReferralUtils as jest.Mocked<typeof ReferralUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('UpdateStatusDecisionController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})

  const radioItems: Array<GovukFrontendRadiosItem> = [
    { text: 'Status A', value: 'STATUS-A' },
    { text: 'Status B', value: 'STATUS-B' },
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
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>
  let referralStatusTransitions: Array<ReferralStatusRefData>

  let controller: UpdateStatusDecisionController

  beforeEach(() => {
    referral = referralFactory.submitted().build({})
    referralStatusHistory = [{ ...referralStatusHistoryFactory.submitted().build(), byLineText: 'You' }]
    referralStatusTransitions = referralStatusRefDataFactory.buildList(2)
    mockReferralUtils.statusOptionsToRadioItems.mockReturnValue(radioItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referralService.getStatusTransitions.mockResolvedValue(referralStatusTransitions)

    controller = new UpdateStatusDecisionController(referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.updateStatus.decision.show({ referralId: referral.id }),
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/decision/show', {
        action: assessPaths.updateStatus.decision.submit({ referralId: referral.id }),
        backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
        pageHeading: 'Update referral status',
        radioItems,
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(mockedFormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['statusDecision'])
      expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusTransitions, undefined)
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)

      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id, { ptUser: true })
    })

    describe('when `referralStatusUpdateData` is for the same referral and contains `status`', () => {
      it('should keep `referralStatusUpdateData` in the session and make the call to check the correct radio item', async () => {
        const session: ReferralStatusUpdateSessionData = {
          referralId: referral.id,
          status: referralStatusTransitions[1].code,
        }
        request.session.referralStatusUpdateData = session

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual(session)
        expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(
          referralStatusTransitions,
          referralStatusTransitions[1].code,
        )
      })
    })

    describe('when `referralStatusUpdateData` is for a different referral', () => {
      it('should remove `referralStatusUpdateData` from the session', async () => {
        request.session.referralStatusUpdateData = { referralId: 'DIFFERENT_REFERRAL_ID', status: 'WITHDRAWN' }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toBeUndefined()
        expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusTransitions, undefined)
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      request.body = { statusDecision: 'NOT_SUITABLE' }
    })

    it('should update `referralStatusUpdateData` and redirect to the update status selection show page', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        previousPath: request.path,
        referralId: referral.id,
        status: 'NOT_SUITABLE',
      })
      expect(response.redirect).toHaveBeenCalledWith(
        assessPaths.updateStatus.selection.show({ referralId: referral.id }),
      )
    })

    describe('when there is no `statusDecision` value in the request body', () => {
      it('should redirect back to the decision page with a flash message', async () => {
        request.body = {}

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('statusDecisionError', 'Select a status decision')
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.decision.show({ referralId: referral.id }),
        )
      })
    })

    describe('when `statusDecision` is `WITHDRAWN`', () => {
      it('should redirect to the withdraw category page', async () => {
        request.body = { statusDecision: 'WITHDRAWN' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          previousPath: request.path,
          referralId: referral.id,
          status: 'WITHDRAWN',
        })
        expect(response.redirect).toHaveBeenCalledWith(assessPaths.withdraw.category({ referralId: referral.id }))
      })
    })
  })
})
