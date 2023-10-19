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

  let reasonController: ReasonController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
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

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = reasonController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/reason/show', {
        pageHeading: 'Add reason for referral and any additional information',
        person,
        referral,
      })

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reason'])
    })
  })

  describe('update', () => {
    const referral = referralFactory.build({ reason: undefined, status: 'referral_started' })

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
    })

    it('ask the service to update the referral and redirects to the referral show action', async () => {
      request.params.referralId = referral.id
      request.body.reason = ' Some reason\nAnother paragraph\n '

      const requestHandler = reasonController.update()
      await requestHandler(request, response, next)

      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referral.id, {
        hasReviewedProgrammeHistory: referral.hasReviewedProgrammeHistory,
        oasysConfirmed: referral.oasysConfirmed,
        reason: 'Some reason\nAnother paragraph',
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
    })

    describe('when the reason is not provided', () => {
      it('redirects to the reason show action with an error', async () => {
        request.params.referralId = referral.id

        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.reason.show({ referralId: referral.id }))
        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter a reason for the referral')
      })
    })

    describe('when the provided reason is just spaces and new lines', () => {
      it('redirects to the reason show action with an error', async () => {
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
