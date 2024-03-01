import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import WithdrawReasonController from './withdrawReasonController'
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

const mockedFormUtils = FormUtils as jest.Mocked<typeof FormUtils>
const mockReferralUtils = ReferralUtils as jest.Mocked<typeof ReferralUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('WithdrawReasonController', () => {
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

  let controller: WithdrawReasonController

  beforeEach(() => {
    referral = referralFactory.submitted().build({})
    referralStatusCodeReasons = referralStatusReasonFactory.buildList(2, { referralCategoryCode: 'A' })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    mockReferralUtils.statusOptionsToRadioItems.mockReturnValue(radioItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referenceDataService.getReferralStatusCodeReasons.mockResolvedValue(referralStatusCodeReasons)

    controller = new WithdrawReasonController(referenceDataService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.withdraw.reason({ referralId: referral.id }),
      session: {
        referralStatusUpdateData: {
          referralId: referral.id,
          status: 'WITHDRAWN',
          statusCategoryCode: 'STATUS-CAT-A',
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

      expect(response.render).toHaveBeenCalledWith('referrals/withdraw/reason/show', {
        backLinkHref: referPaths.withdraw.category({ referralId: referral.id }),
        cancelLink: referPaths.show.statusHistory({ referralId: referral.id }),
        pageHeading: 'Withdrawal reason',
        radioItems,
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referenceDataService.getReferralStatusCodeReasons).toHaveBeenCalledWith(
        username,
        'STATUS-CAT-A',
        'WITHDRAWN',
      )
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

      expect(mockedFormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonCode'])
      expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusCodeReasons, undefined)
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
    })

    describe('when viewing the page on the assess journey', () => {
      it('should render the show template with the correct response locals', async () => {
        request.path = assessPaths.withdraw.reason({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/withdraw/reason/show',
          expect.objectContaining({
            backLinkHref: assessPaths.withdraw.category({ referralId: referral.id }),
            cancelLink: assessPaths.show.statusHistory({ referralId: referral.id }),
          }),
        )
      })
    })

    describe('when there are no referral status code reasons for the provided category code', () => {
      it('should redirect to the reason information page', async () => {
        referenceDataService.getReferralStatusCodeReasons.mockResolvedValue([])

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.withdraw.reasonInformation({ referralId: referral.id }),
        )
      })
    })

    describe('when `referralStatusUpdateData` contains `statusReasonCode`', () => {
      it('should make the call to check the correct radio item', async () => {
        request.session.referralStatusUpdateData = {
          referralId: referral.id,
          status: 'WITHDRAWN',
          statusCategoryCode: 'STATUS-CAT-A',
          statusReasonCode: referralStatusCodeReasons[1].code,
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(
          referralStatusCodeReasons,
          referralStatusCodeReasons[1].code,
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
    let referralStatusUpdateSessionData: ReferralStatusUpdateSessionData

    beforeEach(() => {
      referralStatusUpdateSessionData = {
        referralId: referral.id,
        status: 'WITHDRAWN',
        statusCategoryCode: 'STATUS-CAT-A',
        statusReasonCode: undefined,
      }
      request.body = { reasonCode: 'STATUS-REASON-A' }
      request.session.referralStatusUpdateData = {
        referralId: referral.id,
        status: 'WITHDRAWN',
        statusCategoryCode: 'STATUS-CAT-A',
        statusReasonCode: undefined,
      }
    })

    it('should update `referralStatusUpdateData` and redirect to refer withdraw reason information page', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        ...referralStatusUpdateSessionData,
        previousPath: request.path,
        statusReasonCode: 'STATUS-REASON-A',
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.reasonInformation({ referralId: referral.id }))
    })

    describe('when submitting the form on the assess journey', () => {
      it('should update `referralStatusUpdateData` and redirect to the assess withdraw reason information page', async () => {
        request.path = assessPaths.withdraw.category({ referralId: referral.id })

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          ...referralStatusUpdateSessionData,
          previousPath: request.path,
          statusReasonCode: 'STATUS-REASON-A',
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.withdraw.reasonInformation({ referralId: referral.id }),
        )
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

    describe('when there is no `reasonCode` value is in the request body', () => {
      it('should redirect back to the withdraw page with a flash message', async () => {
        request.body = { reasonCode: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('reasonCodeError', 'Select a withdrawal reason')
        expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.reason({ referralId: referral.id }))
      })
    })
  })
})
