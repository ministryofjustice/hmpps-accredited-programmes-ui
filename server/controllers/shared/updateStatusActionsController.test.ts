import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import UpdateStatusActionsController from './updateStatusActionsController'
import { assessPaths, referPaths } from '../../paths'

describe('UpdateStatusActionsController', () => {
  const referralId = 'REFERRAL-ID'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let controller: UpdateStatusActionsController

  beforeEach(() => {
    controller = new UpdateStatusActionsController()

    request = buildRequest(referPaths.withdraw({ referralId }))
    response = createMock<Response>({})
  })

  function buildRequest(path?: string): DeepMocked<Request> {
    return createMock<Request>({
      params: { referralId },
      session: {},
      ...(path ? { path } : {}),
    })
  }

  describe('manageHold', () => {
    it('should set `referralStatusUpdateData` in the session and redirect to the update status select category show page', async () => {
      request.query = { status: 'ON_HOLD_REFERRAL_SUBMITTED' }

      controller.manageHold()(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        finalStatusDecision: 'ON_HOLD_REFERRAL_SUBMITTED',
        referralId,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.updateStatus.selection.show({ referralId }))
    })
  })

  describe('withdraw', () => {
    it('should set `referralStatusUpdateData` in the session and redirect to the update status select reason show page', async () => {
      controller.withdraw()(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        decisionForCategoryAndReason: 'WITHDRAWN',
        finalStatusDecision: 'WITHDRAWN',
        initialStatusDecision: 'WITHDRAWN',
        referralId,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.updateStatus.reason.show({ referralId }))
    })

    describe('when the path does not start with `/refer`', () => {
      it('should redirect to the assess paths', async () => {
        const request = buildRequest(assessPaths.withdraw({ referralId }))

        controller.withdraw()(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.updateStatus.reason.show({ referralId }))
      })
    })
  })
})
