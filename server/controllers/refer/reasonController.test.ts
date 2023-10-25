import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import ReasonController from './reasonController'
import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('ReasonController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const courseOffering = courseOfferingFactory.build()
  const person = personFactory.build()
  const referralId = 'A-REFERRAL-ID'
  const draftReferral = referralFactory.started().build({
    id: referralId,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    reason: undefined,
  })
  const submittedReferral = referralFactory.submitted().build({
    id: referralId,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    reason: undefined,
  })

  let reasonController: ReasonController

  beforeEach(() => {
    request = createMock<Request>({ params: { referralId }, user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
    reasonController = new ReasonController(personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the reason for referral page', async () => {
      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(draftReferral)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = reasonController.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(response.render).toHaveBeenCalledWith('referrals/reason/show', {
        pageHeading: 'Add additional information',
        person,
        referral: draftReferral,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reason'])
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = reasonController.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.complete({ referralId }))
      })
    })
  })

  describe('update', () => {
    it('ask the service to update the referral and redirects to the referral show action', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)
      request.body.reason = ' Some additional information\nAnother paragraph\n '

      const requestHandler = reasonController.update()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referralId, {
        hasReviewedProgrammeHistory: draftReferral.hasReviewedProgrammeHistory,
        oasysConfirmed: draftReferral.oasysConfirmed,
        reason: 'Some additional information\nAnother paragraph',
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId }))
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.complete({ referralId }))
      })
    })

    describe('when the reason is not provided', () => {
      it('redirects to the reason show action with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.reason.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter additional information')
      })
    })

    describe('when the provided reason is just spaces and new lines', () => {
      it('redirects to the reason show action with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        request.body.reason = ' \n \n '

        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.reason.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter additional information')
      })
    })
  })
})
