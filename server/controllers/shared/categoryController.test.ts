import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CategoryController from './categoryController'
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

const mockReferralUtils = ReferralUtils as jest.Mocked<typeof ReferralUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('CategoryController', () => {
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
  let referralStatusUpdateData: ReferralStatusUpdateSessionData

  let controller: CategoryController

  beforeEach(() => {
    referral = referralFactory.submitted().build({})
    referralStatusCodeCategories = referralStatusCategoryFactory.buildList(2, { referralStatusCode: 'WITHDRAWN' })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    referralStatusUpdateData = {
      decisionForCategoryAndReason: 'DESELECTED',
      finalStatusDecision: 'ASSESSED_SUITABLE',
      initialStatusDecision: 'DESELECTED|OPEN',
      referralId: referral.id,
    }
    mockReferralUtils.statusOptionsToRadioItems.mockReturnValue(radioItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referenceDataService.getReferralStatusCodeCategories.mockResolvedValue(referralStatusCodeCategories)

    controller = new CategoryController(referenceDataService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.updateStatus.category.show({ referralId: referral.id }),
      session: { referralStatusUpdateData },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/category/show', {
        backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
        pageDescription: 'If you deselect the referral, it will be closed.',
        pageHeading: 'Deselection category',
        radioItems,
        radioLegend: 'Choose the deselection category',
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referenceDataService.getReferralStatusCodeCategories).toHaveBeenCalledWith(username, 'DESELECTED')
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['categoryCode'])
      expect(ReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusCodeCategories, undefined)
      expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
    })

    describe('when the request path is on the assess journey', () => {
      it('should render the show template with the correct response locals', async () => {
        request.path = assessPaths.updateStatus.category.show({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/updateStatus/category/show',
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

        expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/category/show', {
          backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
          pageDescription: 'If you withdraw the referral, it will be closed.',
          pageHeading: 'Withdrawal category',
          radioItems,
          radioLegend: 'Select the withdrawal category',
          timelineItems: timelineItems.slice(0, 1),
        })

        expect(referenceDataService.getReferralStatusCodeCategories).toHaveBeenCalledWith(username, 'WITHDRAWN')
        expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['categoryCode'])
        expect(ReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusCodeCategories, undefined)
        expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
      })
    })

    describe('when there is no `referralStatusUpdateData`', () => {
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
  })

  describe('submit', () => {
    beforeEach(() => {
      request.body = { categoryCode: 'STATUS-CAT-A' }
    })

    it('should update `referralStatusUpdateData` and redirect to refer select reason page', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        ...referralStatusUpdateData,
        statusCategoryCode: 'STATUS-CAT-A',
        statusReasonCode: undefined,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.updateStatus.reason.show({ referralId: referral.id }))
    })

    describe('when submitting the form on the assess journey', () => {
      it('should update `referralStatusUpdateData` and redirect to the assess select reason page', async () => {
        request.path = assessPaths.updateStatus.category.show({ referralId: referral.id })

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          ...referralStatusUpdateData,
          statusCategoryCode: 'STATUS-CAT-A',
          statusReasonCode: undefined,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.reason.show({ referralId: referral.id }),
        )
      })
    })

    describe('when there is no `referralStatusUpdateData`', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData

        const requestHandler = controller.submit()
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

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when there is no `referralStatusUpdateData.decisionForCategoryAndReason` value', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData?.decisionForCategoryAndReason

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when there is no `categoryCode` value is in the request body', () => {
      it('should redirect back to the category show page with a flash message', async () => {
        request.body = { categoryCode: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.updateStatus.category.show({ referralId: referral.id }),
        )
        expect(request.flash).toHaveBeenCalledWith('categoryCodeError', 'Select a deselection category')
      })
    })
  })
})
