import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import NewReferralsAdditionalInformationController from './additionalInformationController'
import { authPaths, referPaths } from '../../../paths'
import type { PersonService, ReferralService } from '../../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import { FormUtils, TypeUtils } from '../../../utils'

jest.mock('../../../utils/formUtils')

describe('NewReferralsAdditionalInformationController', () => {
  const username = 'SOME_USERNAME'
  const otherUsername = 'SOME_OTHER_USERNAME'

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
    referrerUsername: username,
  })
  const submittedReferral = referralFactory.submitted().build({
    id: referralId, // eslint-disable-next-line sort-keys
    additionalInformation: undefined,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: username,
  })

  let controller: NewReferralsAdditionalInformationController

  beforeEach(() => {
    request = createMock<Request>({ params: { referralId }, user: { username } })
    response = Helpers.createMockResponseWithCaseloads()
    controller = new NewReferralsAdditionalInformationController(personService, referralService)
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

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(response.render).toHaveBeenCalledWith('referrals/new/additionalInformation/show', {
        maxLength: 4000,
        pageHeading: 'Add additional information',
        person,
        referral: draftReferral,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['additionalInformation'])
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })
  })

  describe('update', () => {
    describe('when there is value for `additionalInformation`', () => {
      beforeEach(() => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        request.body.additionalInformation = ' Some additional information\nAnother paragraph\n '
      })

      it('ask the service to update the referral and redirects to the referral show action', async () => {
        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(referralService.updateReferral).toHaveBeenCalledWith(username, referralId, {
          additionalInformation: 'Some additional information\nAnother paragraph',
          hasReviewedProgrammeHistory: draftReferral.hasReviewedProgrammeHistory,
          oasysConfirmed: draftReferral.oasysConfirmed,
        })
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
      })

      describe('when `req.session.returnTo` is `check-answers`', () => {
        it('redirects to the check answers page with #additionalInformation', async () => {
          request.session.returnTo = 'check-answers'

          const requestHandler = controller.update()
          await requestHandler(request, response, next)

          expect(response.redirect).toHaveBeenCalledWith(
            `${referPaths.new.checkAnswers({ referralId })}#additionalInformation`,
          )
        })
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })

    describe('when additional information is not provided', () => {
      it('redirects to the additional information show action with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.additionalInformation.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('additionalInformationError', 'Enter additional information')
      })
    })

    describe('when the provided additional information is just spaces and new lines', () => {
      it('redirects to the additional information show action with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        request.body.additionalInformation = ' \n \n '

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.additionalInformation.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith('additionalInformationError', 'Enter additional information')
      })
    })

    describe('when `additionalInformation` is too long', () => {
      it('redirects to the additional information show action with an error', async () => {
        const longAdditionalInformation = 'a'.repeat(4001)

        referralService.getReferral.mockResolvedValue(draftReferral)
        request.body = { additionalInformation: longAdditionalInformation }

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'additionalInformationError',
          'Additional information must be 4000 characters or fewer',
        )
        expect(request.flash).toHaveBeenCalledWith('formValues', [
          JSON.stringify({ formattedAdditionalInformation: longAdditionalInformation }),
        ])
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.additionalInformation.show({ referralId }))
      })
    })
  })
})
