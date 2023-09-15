import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import ReasonController from './reasonController'
import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../testutils/factories'

describe('ReasonController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const courseOffering = courseOfferingFactory.build()

  let reasonController: ReasonController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    reasonController = new ReasonController(personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the reason for referral page', async () => {
      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory
        .started()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)

      const requestHandler = reasonController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/reason', {
        pageHeading: 'Add reason for referral and any additional information',
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

        const requestHandler = reasonController.show()
        const expectedError = createError(404, `Person with prison number ${referral.prisonNumber} not found.`)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('update', () => {
    const referral = referralFactory.build({ reason: undefined, status: 'referral_started' })

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
    })

    it('updates the referral and redirects to the referral show page', async () => {
      request.body.reason = ' Some reason\nAnother paragraph\n '

      const requestHandler = reasonController.update()
      await requestHandler(request, response, next)

      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referral.id, {
        oasysConfirmed: referral.oasysConfirmed,
        reason: 'Some reason\nAnother paragraph',
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
    })

    describe('when the reason is not provided', () => {
      it('redirects to the reason show page with an error', async () => {
        request.params.referralId = referral.id

        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.reason.show({ referralId: referral.id }))
        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter a reason for the referral')
      })
    })

    describe('when the provided reason is just spaces and new lines', () => {
      it('redirects to the reason show page with an error', async () => {
        request.params.referralId = referral.id

        request.body.reason = ' \n \n '

        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.reason.show({ referralId: referral.id }))
        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter a reason for the referral')
      })
    })
  })
})
