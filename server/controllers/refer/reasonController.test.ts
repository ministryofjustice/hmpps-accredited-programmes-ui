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
        pageHeading: 'Add reason for referral and any additional information',
        person,
        referral: draftReferral,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reason'])
    })
  })

  describe('update', () => {
    it('ask the service to update the referral and redirects to the referral show action', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)
      request.body.reason = ' Some reason\nAnother paragraph\n '

      const requestHandler = reasonController.update()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referralId, {
        hasReviewedProgrammeHistory: draftReferral.hasReviewedProgrammeHistory,
        oasysConfirmed: draftReferral.oasysConfirmed,
        reason: 'Some reason\nAnother paragraph',
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId }))
    })

    describe('when the reason is not provided', () => {
      it('redirects to the reason show action with an error', async () => {
        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.reason.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter a reason for the referral')
      })
    })

    describe('when the provided reason is just spaces and new lines', () => {
      it('redirects to the reason show action with an error', async () => {
        request.body.reason = ' \n \n '

        const requestHandler = reasonController.update()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.reason.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('reasonError', 'Enter a reason for the referral')
      })
    })
  })
})
