import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import UpdateStatusActionsController from './updateStatusActionsController'
import { referPaths } from '../../paths'

describe('UpdateStatusActionsController', () => {
  const referralId = 'REFERRAL-ID'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let controller: UpdateStatusActionsController

  beforeEach(() => {
    controller = new UpdateStatusActionsController()

    request = createMock<Request>({
      params: { referralId },
      session: {},
    })
    response = createMock<Response>({})
  })

  describe('withdraw', () => {
    it('should set `referralStatusUpdateData` in the session and redirect to the update status select category show page', async () => {
      controller.withdraw()(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        referralId,
        status: 'WITHDRAWN',
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.updateStatus.category.show({ referralId }))
    })
  })
})
