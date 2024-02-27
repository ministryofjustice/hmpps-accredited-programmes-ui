import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import WithdrawCategoryController from './withdrawCategoryController'
import type { ReferralStatusUpdateSessionData } from '../../@types/express'
import { assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { referralFactory, referralStatusCategoryFactory, referralStatusHistoryFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ReferralUtils, ShowReferralUtils } from '../../utils'
import type { Referral, ReferralStatusCategory } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { GovukFrontendRadiosItem } from '@govuk-frontend'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/referralUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockedFormUtils = FormUtils as jest.Mocked<typeof FormUtils>
const mockReferralUtils = ReferralUtils as jest.Mocked<typeof ReferralUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('WithdrawCategoryController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referenceDataService = createMock<ReferenceDataService>({})
  const referralService = createMock<ReferralService>({})

  const radioItems: Array<GovukFrontendRadiosItem> = [
    { text: 'Category A', value: 'A' },
    { text: 'Category B', value: 'B' },
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
  let referralStatusCodeCategories: Array<ReferralStatusCategory>
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>

  let controller: WithdrawCategoryController

  beforeEach(() => {
    referral = referralFactory.submitted().build({})
    referralStatusCodeCategories = [
      referralStatusCategoryFactory.build({ referralStatusCode: 'WITHDRAWN' }),
      referralStatusCategoryFactory.build({ referralStatusCode: 'WITHDRAWN' }),
    ]
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    mockReferralUtils.statusCategoriesToRadioItems.mockReturnValue(radioItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    referralService.getReferral.mockResolvedValue(referral)
    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referenceDataService.getReferralStatusCodeCategories.mockResolvedValue(referralStatusCodeCategories)

    controller = new WithdrawCategoryController(referenceDataService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.withdraw.category({ referralId: referral.id }),
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/withdraw/category/show', {
        action: referPaths.withdraw.category({ referralId: referral.id }),
        backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
        pageHeading: 'Withdrawal category',
        radioItems,
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referenceDataService.getReferralStatusCodeCategories).toHaveBeenCalledWith(username, 'WITHDRAWN')
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

      expect(mockedFormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['categoryCode'])
      expect(mockReferralUtils.statusCategoriesToRadioItems).toHaveBeenCalledWith(
        referralStatusCodeCategories,
        undefined,
      )
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
    })

    describe('when viewing the page on the assess journey', () => {
      it('should render the show template with the correct response locals', async () => {
        request.path = assessPaths.withdraw.category({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/withdraw/category/show',
          expect.objectContaining({
            action: assessPaths.withdraw.category({ referralId: referral.id }),
            backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
          }),
        )
      })
    })

    describe('when `referralStatusUpdateData` is for the same referral', () => {
      it('should keep `referralStatusUpdateData` in the session and make the call to check the correct radio item', async () => {
        const session: ReferralStatusUpdateSessionData = {
          referralId: referral.id,
          status: 'WITHDRAWN',
          statusCategoryCode: 'A',
        }
        request.session.referralStatusUpdateData = session

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual(session)
        expect(mockReferralUtils.statusCategoriesToRadioItems).toHaveBeenCalledWith(referralStatusCodeCategories, 'A')
      })
    })

    describe('when `referralStatusUpdateData` is for a different referral', () => {
      it('should remove `referralStatusUpdateData` from the session', async () => {
        request.session.referralStatusUpdateData = { referralId: 'DIFFERENT_REFERRAL_ID', status: 'WITHDRAWN' }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toBeUndefined()
        expect(mockReferralUtils.statusCategoriesToRadioItems).toHaveBeenCalledWith(
          referralStatusCodeCategories,
          undefined,
        )
      })
    })

    describe('when `referralStatusUpdateData` is for a different status to `WITHDRAWN`', () => {
      it('should remove `referralStatusUpdateData` from the session', async () => {
        request.session.referralStatusUpdateData = { referralId: referral.id, status: 'DESELECTED' }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toBeUndefined()
        expect(mockReferralUtils.statusCategoriesToRadioItems).toHaveBeenCalledWith(
          referralStatusCodeCategories,
          undefined,
        )
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      request.body = { categoryCode: 'STATUS-CAT-A' }
      request.session.referralStatusUpdateData = {
        referralId: 'ANOTHER-REFERRAL',
        status: 'WITHDRAWN',
        statusCategoryCode: 'STATUS-CAT-B',
        statusReasonCode: 'STATUS-REASON-A',
      }
    })

    it('should update `referralStatusUpdateData` and redirect to refer withdraw reason page', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        referralId: referral.id,
        status: 'WITHDRAWN',
        statusCategoryCode: 'STATUS-CAT-A',
        statusReasonCode: undefined,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.reason({ referralId: referral.id }))
    })

    describe('when submitting the form on the assess journey', () => {
      it('should update `referralStatusUpdateData` and redirect to the assess withdraw reason page', async () => {
        request.path = assessPaths.withdraw.category({ referralId: referral.id })

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          referralId: referral.id,
          status: 'WITHDRAWN',
          statusCategoryCode: 'STATUS-CAT-A',
          statusReasonCode: undefined,
        })
        expect(response.redirect).toHaveBeenCalledWith(assessPaths.withdraw.reason({ referralId: referral.id }))
      })
    })

    describe('when there is no `categoryCode` value is in the request body', () => {
      it('should redirect back to the show page with a flash message', async () => {
        request.body = { categoryCode: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.withdraw.category({ referralId: referral.id }))
        expect(request.flash).toHaveBeenCalledWith('categoryCodeError', 'Select a withdrawal category')
      })
    })
  })
})
