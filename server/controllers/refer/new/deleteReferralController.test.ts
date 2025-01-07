import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import NewReferralsDeleteController from './deleteReferralController'
import type { PersonService, ReferralService } from '../../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'

describe('NewReferralsDeleteController', () => {
  const username = 'SOME_USERNAME'

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

  let controller: NewReferralsDeleteController

  beforeEach(() => {
    request = createMock<Request>({ params: { referralId }, user: { username } })
    response = Helpers.createMockResponseWithCaseloads()
    controller = new NewReferralsDeleteController(personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the delete draft referral page with the correct response locals', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)
      personService.getPerson.mockResolvedValue(person)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
      expect(response.render).toHaveBeenCalledWith('referrals/new/delete/show', {
        action: '/refer/referrals/new/A-REFERRAL-ID/delete?_method=DELETE',
        hrefs: { back: '/refer/referrals/new/A-REFERRAL-ID' },
        pageHeading: 'Delete draft referral?',
        pageTitleOverride: 'Delete draft referral ',

        person,
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the personal details screen of the subitted referral', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith('/refer/referrals/A-REFERRAL-ID/personal-details')
        expect(personService.getPerson).not.toHaveBeenCalled()
      })
    })
  })

  describe('submit', () => {
    it('calls the referral service to delete the draft referral and redirects to the draft case list with a flash message', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)
      personService.getPerson.mockResolvedValue(person)

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
      expect(referralService.deleteReferral).toHaveBeenCalledWith(username, referralId)
      expect(request.flash).toHaveBeenCalledWith(
        'draftReferralDeletedMessage',
        `Draft referral for ${person.name} deleted.`,
      )
      expect(response.redirect).toHaveBeenCalledWith('/refer/referrals/case-list/draft')
    })
  })
})
