import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import UpdateStatusSelectionController from './updateStatusSelectionController'
import { assessPaths, referPaths } from '../../paths'
import type { PersonService, ReferenceDataService, ReferralService } from '../../services'
import {
  confirmationFieldsFactory,
  personFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusRefDataFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ShowReferralUtils } from '../../utils'
import type { ConfirmationFields, Person } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { Referral } from '@accredited-programmes-api'

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
  const referenceDataService = createMock<ReferenceDataService>({})
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

    controller = new UpdateStatusSelectionController(personService, referenceDataService, referralService)

    request = buildRequest(assessPaths.updateStatus.selection.show({ referralId: referral.id }))
    response = Helpers.createMockResponseWithCaseloads()
  })

  function buildRequest(path?: string): DeepMocked<Request> {
    return createMock<Request>({
      params: { referralId: referral.id },
      path,
      session: {
        referralStatusUpdateData: {
          finalStatusDecision: 'ON_PROGRAMME',
          referralId: referral.id,
        },
      },
      user: { token: userToken, username },
    })
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/selection/show', {
        action: assessPaths.updateStatus.selection.reason.submit({ referralId: referral.id }),
        backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
        confirmationText,
        maxLength: 500,
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
      expect(personService.getPerson).toHaveBeenCalledWith(username, referral.prisonNumber)
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reason'])
      expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response)
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
        const request = buildRequest(referPaths.updateStatus.selection.show({ referralId: referral.id }))

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
  })

  describe('submitReason', () => {
    const code = 'NOT_SUITABLE'
    const reason = 'This person is not suitable for the programme.'

    beforeEach(() => {
      request.body = { reason }
      request.session.referralStatusUpdateData = {
        finalStatusDecision: code,
        referralId: referral.id,
        statusCategoryCode: 'STATUS_CATEGORY_CODE',
        statusReasonCode: 'STATUS_REASON_CODE',
      }
      referenceDataService.getReferralStatusCodeData.mockResolvedValue(
        referralStatusRefDataFactory.build({
          code,
          hasNotes: true,
          notesOptional: false,
        }),
      )
    })

    it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the status history page of the referral', async () => {
      const requestHandler = controller.submitReason()
      await requestHandler(request, response, next)

      expect(referenceDataService.getReferralStatusCodeData).toHaveBeenCalledWith(username, 'NOT_SUITABLE')
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
        const request = buildRequest(referPaths.updateStatus.selection.show({ referralId: referral.id }))

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
      describe('and `notesOptional` is `false`', () => {
        it('should redirect to the update status selection show page with a flash message', async () => {
          request.body = {}

          const requestHandler = controller.submitReason()
          await requestHandler(request, response, next)

          expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter additional information')
          expect(response.redirect).toHaveBeenCalledWith(
            assessPaths.updateStatus.selection.show({ referralId: referral.id }),
          )
        })
      })

      describe('and `notesOptional` is `true`', () => {
        it('should update the referral status, delete `referralStatusUpdateData` and redirect back to the status history page of the referral', async () => {
          referenceDataService.getReferralStatusCodeData.mockResolvedValue(
            referralStatusRefDataFactory.build({ code, hasNotes: true, notesOptional: true }),
          )

          request.body = {}

          const requestHandler = controller.submitReason()
          await requestHandler(request, response, next)

          expect(referralService.updateReferralStatus).toHaveBeenCalledWith(username, referral.id, {
            category: 'STATUS_CATEGORY_CODE',
            notes: undefined,
            ptUser: true,
            reason: 'STATUS_REASON_CODE',
            status: 'NOT_SUITABLE',
          })
          expect(request.session.referralStatusUpdateData).toBeUndefined()
          expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: referral.id }))
        })
      })
    })

    describe('when `reason` is too long', () => {
      it('should redirect to the update status selection show page with a flash message', async () => {
        const longReason = 'a'.repeat(501)

        request.body = { reason: longReason }

        const requestHandler = controller.submitReason()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'reasonError',
          'Additional information must be 500 characters or fewer',
        )
        expect(request.flash).toHaveBeenCalledWith('formValues', [JSON.stringify({ reason: longReason })])
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })
    })
  })
})
