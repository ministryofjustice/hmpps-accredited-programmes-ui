import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AdditionalInformationController from './additionalInformationController'
import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('AdditionalInformationController', () => {
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
    id: referralId, // eslint-disable-next-line sort-keys
    additionalInformation: undefined,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
  })
  const submittedReferral = referralFactory.submitted().build({
    id: referralId, // eslint-disable-next-line sort-keys
    additionalInformation: undefined,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
  })

  let additionalInformationController: AdditionalInformationController

  beforeEach(() => {
    request = createMock<Request>({ params: { referralId }, user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
    additionalInformationController = new AdditionalInformationController(personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the additional information page', async () => {
      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(draftReferral)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = additionalInformationController.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(response.render).toHaveBeenCalledWith('referrals/additionalInformation/show', {
        pageHeading: 'Add additional information',
        person,
        referral: draftReferral,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['additionalInformation'])
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = additionalInformationController.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.complete({ referralId }))
      })
    })
  })

  describe('update', () => {
    it('ask the service to update the referral and redirects to the referral show action', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)
      request.body.additionalInformation = ' Some additional information\nAnother paragraph\n '

      const requestHandler = additionalInformationController.update()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referralId, {
        additionalInformation: 'Some additional information\nAnother paragraph',
        hasReviewedProgrammeHistory: draftReferral.hasReviewedProgrammeHistory,
        oasysConfirmed: draftReferral.oasysConfirmed,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId }))
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = additionalInformationController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.complete({ referralId }))
      })
    })

    describe('when additional information is not provided', () => {
      it('redirects to the additional information show action with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = additionalInformationController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.additionalInformation.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('additionalInformationError', 'Enter additional information')
      })
    })

    describe('when the provided additional information is just spaces and new lines', () => {
      it('redirects to the additional information show action with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        request.body.additionalInformation = ' \n \n '

        const requestHandler = additionalInformationController.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.additionalInformation.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('additionalInformationError', 'Enter additional information')
      })
    })
  })
})