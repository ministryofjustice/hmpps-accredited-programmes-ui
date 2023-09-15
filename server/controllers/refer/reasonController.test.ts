import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import ReasonController from './reasonController'
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
})
