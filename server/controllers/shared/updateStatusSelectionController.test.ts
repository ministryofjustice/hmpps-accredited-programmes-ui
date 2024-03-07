import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import UpdateStatusSelectionController from './updateStatusSelectionController'
import { assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { referralFactory, referralStatusHistoryFactory, referralStatusRefDataFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ShowReferralUtils } from '../../utils'
import type { Referral, ReferralStatusRefData } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('UpdateStatusSelectionController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})
  const referenceDataService = createMock<ReferenceDataService>({})

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
  let referralStatusRefData: ReferralStatusRefData

  let controller: UpdateStatusSelectionController

  beforeEach(() => {
    referral = referralFactory.submitted().build()
    referralStatusHistory = [{ ...referralStatusHistoryFactory.submitted().build(), byLineText: 'You' }]
    referralStatusRefData = referralStatusRefDataFactory.build({ description: 'On Programme', hasConfirmation: true })
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referenceDataService.getReferralStatusCodeData.mockResolvedValue(referralStatusRefData)

    controller = new UpdateStatusSelectionController(referenceDataService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.updateStatus.selection.show({ referralId: referral.id }),
      session: { referralStatusUpdateData: { referralId: referral.id, status: 'ON_PROGRAMME' } },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/selection/show', {
        action: assessPaths.updateStatus.selection.confirmation.submit({ referralId: referral.id }),
        backLinkHref: '#',
        maxLength: 100,
        pageHeading: 'Move referral to on programme',
        referralStatusRefData,
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(referenceDataService.getReferralStatusCodeData).toHaveBeenCalledWith(username, 'ON_PROGRAMME')
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['confirmation'])
    })

    describe('when `referralStatusUpdateData` is not present', () => {
      it('should redirect to the status history route', async () => {
        request.session.referralStatusUpdateData = undefined

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData` is for a different referral', () => {
      it('should redirect to the status history route', async () => {
        request.session.referralStatusUpdateData = {
          referralId: 'DIFFERENT_REFERRAL_ID',
          status: 'WITHDRAWN',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when the reference data requires notes instead of confirmation', () => {
      it('should render the template with the correct form action and call the relevant `FormUtils` methods', async () => {
        referralStatusRefData = referralStatusRefDataFactory.build({ description: 'On Programme', hasNotes: true })
        referenceDataService.getReferralStatusCodeData.mockResolvedValue(referralStatusRefData)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/updateStatus/selection/show',
          expect.objectContaining({
            action: assessPaths.updateStatus.selection.reason.submit({ referralId: referral.id }),
          }),
        )

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reason'])
        expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response)
      })
    })
  })

  describe('submitConfirmation', () => {
    beforeEach(() => {
      request.body = { confirmation: 'true' }
    })

    it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the status history page of the referral', async () => {
      const requestHandler = controller.submitConfirmation()
      await requestHandler(request, response, next)

      expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
        ptUser: true,
        status: 'ON_PROGRAMME',
      })
      expect(request.session.referralStatusUpdateData).toBeUndefined()
      expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
    })

    describe('when there is no `referralStatusUpdateData`', () => {
      it('should redirect to the status history route', async () => {
        request.session.referralStatusUpdateData = undefined

        const requestHandler = controller.submitConfirmation()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when submitting the form on the refer journey', () => {
      it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the refer status history page of the referral', async () => {
        request.path = referPaths.updateStatus.selection.show({ referralId: referral.id })

        const requestHandler = controller.submitConfirmation()
        await requestHandler(request, response, next)

        expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
          ptUser: false,
          status: 'ON_PROGRAMME',
        })
        expect(request.session.referralStatusUpdateData).toBeUndefined()
        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `confirmation` is not present', () => {
      it('should redirect to the update status selection show page', async () => {
        request.body = {}

        const requestHandler = controller.submitConfirmation()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('confirmationError', 'Select confirmation')
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })
    })
  })

  describe('submitReason', () => {
    const reason = 'This person is not suitable for the programme.'

    beforeEach(() => {
      request.body = { reason }
      request.session.referralStatusUpdateData = { referralId: referral.id, status: 'NOT_SUITABLE' }
    })

    it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the status history page of the referral', async () => {
      const requestHandler = controller.submitReason()
      await requestHandler(request, response, next)

      expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
        notes: reason,
        ptUser: true,
        status: 'NOT_SUITABLE',
      })
      expect(request.session.referralStatusUpdateData).toBeUndefined()
      expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
    })

    describe('when there is no `referralStatusUpdateData`', () => {
      it('should redirect to the status history route', async () => {
        request.session.referralStatusUpdateData = undefined

        const requestHandler = controller.submitReason()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when submitting the form on the refer journey', () => {
      it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the refer status history page of the referral', async () => {
        request.path = referPaths.updateStatus.selection.show({ referralId: referral.id })

        const requestHandler = controller.submitReason()
        await requestHandler(request, response, next)

        expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
          notes: reason,
          ptUser: false,
          status: 'NOT_SUITABLE',
        })
        expect(request.session.referralStatusUpdateData).toBeUndefined()
        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `reason` is not present', () => {
      it('should redirect to the update status selection show page with a flash message', async () => {
        request.body = {}

        const requestHandler = controller.submitReason()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter a reason')
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })
    })

    describe('when `reason` is too long', () => {
      it('should redirect to the update status selection show page with a flash message', async () => {
        const longReason = 'a'.repeat(101)

        request.body = { reason: longReason }

        const requestHandler = controller.submitReason()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Reason must be 100 characters or less')
        expect(request.flash).toHaveBeenCalledWith('formValues', [JSON.stringify({ reason: longReason })])
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })
    })
  })
})
