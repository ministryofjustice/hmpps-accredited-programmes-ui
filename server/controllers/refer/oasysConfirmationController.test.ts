import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import OasysConfirmationController from './oasysConfirmationController'
import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../testutils/factories'

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
    response = createMock<Response>({})
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

      const requestHandler = oasysConfirmationController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/oasysConfirmation/show', {
        pageHeading: 'Confirm the OASys information',
        person,
        referral,
      })
    })

    describe('when the person service returns `null`', () => {
      it('responds with a 404', async () => {
        const person = personFactory.build()
        personService.getPerson.mockResolvedValue(null)

        const referral = referralFactory
          .started()
          .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
        referralService.getReferral.mockResolvedValue(referral)

        const requestHandler = oasysConfirmationController.show()
        const expectedError = createError(404)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('update', () => {
    it("asks the service to update the field and redirects to the ReferralController's show action", async () => {
      const referral = referralFactory.build({ oasysConfirmed: false, status: 'referral_started' })
      referralService.getReferral.mockResolvedValue(referral)

      request.body.oasysConfirmed = true

      const requestHandler = oasysConfirmationController.update()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referral.id, {
        oasysConfirmed: true,
        reason: referral.reason,
      })
    })
  })
})
