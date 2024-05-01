import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import UpdateStatusSelectionController from './updateStatusSelectionController'
import { assessPaths, referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import {
  confirmationFieldsFactory,
  personFactory,
  referralFactory,
  referralStatusHistoryFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ShowReferralUtils } from '../../utils'
import type { ConfirmationFields, Person, Referral } from '@accredited-programmes/models'
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

  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  let person: Person
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
  let confirmationText: ConfirmationFields

  let controller: UpdateStatusSelectionController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.submitted().build(), byLineText: 'You' }]
    confirmationText = confirmationFieldsFactory.build({ hasConfirmation: true })
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referralService.getConfirmationText.mockResolvedValue(confirmationText)

    controller = new UpdateStatusSelectionController(personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.updateStatus.selection.show({ referralId: referral.id }),
      session: {
        referralStatusUpdateData: {
          finalStatusDecision: 'ON_PROGRAMME',
          referralId: referral.id,
        },
      },
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
        backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
        confirmationText,
        maxLength: 100,
        pageHeading: confirmationText.primaryHeading,
        person,
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(referralService.getConfirmationText).toHaveBeenCalledWith(username, referral.id, 'ON_PROGRAMME', {
        deselectAndKeepOpen: false,
        ptUser: true,
      })
      expect(personService.getPerson).toHaveBeenCalledWith(
        username,
        referral.prisonNumber,
        response.locals.user.caseloads,
      )
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['confirmation'])
    })

    describe('when the `initialStatusDecision` is `DESELECTED|OPEN`', () => {
      it('should make the correct call to `getConfirmationText`', async () => {
        request.session.referralStatusUpdateData = {
          decisionForCategoryAndReason: 'DESELECTED',
          finalStatusDecision: 'DESELECTED',
          initialStatusDecision: 'DESELECTED|OPEN',
          referralId: referral.id,
          statusCategoryCode: 'D_OPERATIONAL',
          statusReasonCode: 'D_DEPORTED',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getConfirmationText).toHaveBeenCalledWith(username, referral.id, 'DESELECTED', {
          deselectAndKeepOpen: true,
          ptUser: true,
        })
      })
    })

    describe('when the request path is on the refer journey', () => {
      it('should render the show template with the correct response locals and make the correct call to `getConfirmationText`', async () => {
        request.path = referPaths.updateStatus.selection.show({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/updateStatus/selection/show',
          expect.objectContaining({
            backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
          }),
        )

        expect(referralService.getConfirmationText).toHaveBeenCalledWith(username, referral.id, 'ON_PROGRAMME', {
          deselectAndKeepOpen: false,
          ptUser: false,
        })
      })
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
          finalStatusDecision: 'WITHDRAWN',
          referralId: 'DIFFERENT_REFERRAL_ID',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData` is missing `finalStatusDecision`', () => {
      it('should redirect to the status history route', async () => {
        request.session.referralStatusUpdateData = {
          referralId: referral.id,
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when the confirmation text endpoint returns `hasConfirmation: false`', () => {
      it('should render the template with the correct form action and call the relevant `FormUtils` methods', async () => {
        confirmationText = confirmationFieldsFactory.build({ hasConfirmation: false })
        referralService.getConfirmationText.mockResolvedValue(confirmationText)

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

    describe('when `referralStatusUpdateData` is for a different referral', () => {
      it('should redirect to the status history route', async () => {
        request.session.referralStatusUpdateData = {
          finalStatusDecision: 'ON_PROGRAMME',
          referralId: 'DIFFERENT_REFERRAL_ID',
        }

        const requestHandler = controller.submitConfirmation()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
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
      request.session.referralStatusUpdateData = {
        finalStatusDecision: 'NOT_SUITABLE',
        referralId: referral.id,
        statusCategoryCode: 'STATUS_CATEGORY_CODE',
        statusReasonCode: 'STATUS_REASON_CODE',
      }
    })

    it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the status history page of the referral', async () => {
      const requestHandler = controller.submitReason()
      await requestHandler(request, response, next)

      expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
        category: 'STATUS_CATEGORY_CODE',
        notes: reason,
        ptUser: true,
        reason: 'STATUS_REASON_CODE',
        status: 'NOT_SUITABLE',
      })
      expect(request.session.referralStatusUpdateData).toBeUndefined()
      expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
    })

    describe('when `referralStatusUpdateData` is for a different referral', () => {
      it('should redirect to the status history route', async () => {
        request.session.referralStatusUpdateData = {
          finalStatusDecision: 'ON_PROGRAMME',
          referralId: 'DIFFERENT_REFERRAL_ID',
        }

        const requestHandler = controller.submitReason()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
      })
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
          category: 'STATUS_CATEGORY_CODE',
          notes: reason,
          ptUser: false,
          reason: 'STATUS_REASON_CODE',
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
