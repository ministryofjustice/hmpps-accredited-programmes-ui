import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import WithdrawReasonInformationController from './withdrawReasonInformationController'
import { assessPaths, referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { referralFactory, referralStatusHistoryFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ShowReferralUtils } from '../../utils'
import type { Referral } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockedFormUtils = FormUtils as jest.Mocked<typeof FormUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('WithdrawReasonInformationController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})

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

  let controller: WithdrawReasonInformationController

  beforeEach(() => {
    referral = referralFactory.submitted().build({})
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)

    controller = new WithdrawReasonInformationController(referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.withdraw.reasonInformation({ referralId: referral.id }),
      session: {
        referralStatusUpdateData: {
          previousPath: '/previous-path',
          referralId: referral.id,
          status: 'WITHDRAWN',
          statusCategoryCode: 'STATUS-CAT-A',
          statusReasonCode: 'STATUS-REASON-A',
        },
      },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/withdraw/reason-information/show', {
        backLinkHref: '/previous-path',
        cancelLink: referPaths.show.statusHistory({ referralId: referral.id }),
        maxLength: 100,
        pageHeading: 'Withdraw referral',
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(mockedFormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonInformation'])
      expect(mockedFormUtils.setFormValues).toHaveBeenCalledWith(request, response)
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
    })

    describe('when viewing the page on the assess journey', () => {
      it('should render the show template with the correct response locals', async () => {
        request.path = assessPaths.withdraw.reasonInformation({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/withdraw/reason-information/show',
          expect.objectContaining({
            backLinkHref: '/previous-path',
            cancelLink: assessPaths.show.statusHistory({ referralId: referral.id }),
          }),
        )
      })
    })

    describe('when `referralStatusUpdateData` is for a different referral', () => {
      it('should redirect back to the withdraw category route', async () => {
        request.session.referralStatusUpdateData = {
          referralId: 'DIFFERENT_REFERRAL_ID',
          status: 'WITHDRAWN',
          statusCategoryCode: 'STATUS-CAT-A',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.category({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData` is for a different status to `WITHDRAWN`', () => {
      it('should redirect back to the withdraw category route', async () => {
        request.session.referralStatusUpdateData = {
          referralId: referral.id,
          status: 'DESELECTED',
          statusCategoryCode: 'STATUS-CAT-A',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.category({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData` does not contain a `statusCategoryCode`', () => {
      it('should redirect back to the withdraw category route', async () => {
        request.session.referralStatusUpdateData = {
          referralId: referral.id,
          status: 'WITHDRAWN',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.category({ referralId: referral.id }))
      })
    })
  })

  describe('submit', () => {
    const reasonInformation = 'I have changed my mind.'

    beforeEach(() => {
      request.body = { reasonInformation }
    })

    it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the status history page of the referral', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
        category: 'STATUS-CAT-A',
        notes: reasonInformation,
        reason: 'STATUS-REASON-A',
        status: 'WITHDRAWN',
      })
      expect(request.session.referralStatusUpdateData).toBeUndefined()
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
    })

    describe('when submitting the form on the assess journey', () => {
      it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the assess status history page of the referral', async () => {
        request.path = assessPaths.withdraw.reasonInformation({ referralId: referral.id })

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
          category: 'STATUS-CAT-A',
          notes: reasonInformation,
          reason: 'STATUS-REASON-A',
          status: 'WITHDRAWN',
        })
        expect(request.session.referralStatusUpdateData).toBeUndefined()
        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData` does not contain a `statusCategoryCode`', () => {
      it('should redirect back to the withdraw category route', async () => {
        request.session.referralStatusUpdateData = {
          referralId: referral.id,
          status: 'WITHDRAWN',
        }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.category({ referralId: referral.id }))
      })
    })

    describe('when `reasonInformation` is not provided', () => {
      it('should redirect back to the current page with a flash message', async () => {
        request.body = { reasonInformation: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('reasonInformationError', 'Enter withdrawal reason information')
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.withdraw.reasonInformation({ referralId: referral.id }),
        )
      })
    })

    describe('when `reasonInformation` is too long', () => {
      it('should redirect back to the current page with a flash errorMessage and flash formValues', async () => {
        const longReasonInformation = 'a'.repeat(101)

        request.body = { reasonInformation: longReasonInformation }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'reasonInformationError',
          'Withdrawal reason must be 100 characters or less',
        )
        expect(request.flash).toHaveBeenCalledWith('formValues', [
          JSON.stringify({ reasonInformation: longReasonInformation }),
        ])
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.withdraw.reasonInformation({ referralId: referral.id }),
        )
      })
    })
  })
})
