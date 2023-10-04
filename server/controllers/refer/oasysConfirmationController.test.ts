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

  let oasysConfirmationController: OasysConfirmationController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
    oasysConfirmationController = new OasysConfirmationController(personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the show template for confirming OASys information is up to date', async () => {
      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory
        .started()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = oasysConfirmationController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/oasysConfirmation/show', {
        pageHeading: 'Confirm the OASys information',
        person,
        referral,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['oasysConfirmed'])
    })
  })

  describe('update', () => {
    const referral = referralFactory.build({ oasysConfirmed: false, status: 'referral_started' })

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
    })

    it("asks the service to update the field and redirects to the ReferralController's show action", async () => {
      request.body.oasysConfirmed = true

      const requestHandler = oasysConfirmationController.update()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referral.id, {
        oasysConfirmed: true,
        reason: referral.reason,
      })
    })

    describe('when the `oasysConfirmed` field is not set', () => {
      it('redirects back to the confirm oasys page with an error', async () => {
        request.params.referralId = referral.id

        const requestHandler = oasysConfirmationController.update()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.confirmOasys.show({ referralId: referral.id }))
        expect(request.flash).toHaveBeenCalledWith('oasysConfirmedError', 'Confirm the OASys information is up to date')
      })
    })
  })
})
