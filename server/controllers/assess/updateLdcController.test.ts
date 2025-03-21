import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import UpdateLdcController from './updateLdcController'
import { assessPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import type { Referral } from '@accredited-programmes-api'

describe('UpdateLdcController', () => {
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const person = personFactory.build()

  let referral: Referral

  let controller: UpdateLdcController

  beforeEach(() => {
    referral = referralFactory.submitted().build({ hasLdc: true, prisonNumber: person.prisonNumber })

    controller = new UpdateLdcController(personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.updateLdc.show({ referralId: referral.id }),
      user: { username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the show page with the correct response locals', async () => {
      when(personService.getPerson).calledWith(username, referral.prisonNumber).mockResolvedValue(person)
      when(referralService.getReferral).calledWith(username, referral.id).mockResolvedValue(referral)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/updateLdc/show', {
        backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
        hasLdc: true,
        pageHeading: 'Update Learning disabilities and challenges (LDC)',
        person,
      })
    })
  })
})
