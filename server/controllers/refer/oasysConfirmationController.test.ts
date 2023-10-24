import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import OasysConfirmationController from './oasysConfirmationController'
import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('OasysConfirmationController', () => {
  const token = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const courseOffering = courseOfferingFactory.build()
  const person = personFactory.build()
  const referralId = 'A-REFERRAL-ID'
  const draftReferral = referralFactory
    .started()
    .build({ id: referralId, oasysConfirmed: false, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
  const submittedReferral = referralFactory
    .submitted()
    .build({ id: referralId, oasysConfirmed: false, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

  let oasysConfirmationController: OasysConfirmationController

  beforeEach(() => {
    request = createMock<Request>({ params: { referralId }, user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
    oasysConfirmationController = new OasysConfirmationController(personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the show template for confirming OASys information is up to date', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)
      personService.getPerson.mockResolvedValue(person)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = oasysConfirmationController.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(response.render).toHaveBeenCalledWith('referrals/oasysConfirmation/show', {
        pageHeading: 'Confirm the OASys information',
        person,
        referral: draftReferral,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['oasysConfirmed'])
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = oasysConfirmationController.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.complete({ referralId }))
      })
    })
  })

  describe('update', () => {
    it("asks the service to update the field and redirects to the ReferralController's show action", async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)

      request.body.oasysConfirmed = true

      const requestHandler = oasysConfirmationController.update()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId }))
      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referralId, {
        hasReviewedProgrammeHistory: draftReferral.hasReviewedProgrammeHistory,
        oasysConfirmed: true,
        reason: draftReferral.reason,
      })
    })

    describe('when the `oasysConfirmed` field is not set', () => {
      it('redirects back to the confirm oasys page with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        const requestHandler = oasysConfirmationController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.confirmOasys.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('oasysConfirmedError', 'Confirm the OASys information is up to date')
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = oasysConfirmationController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.complete({ referralId }))
      })
    })
  })
})
