import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import NewReferralsPeopleController from './peopleController'
import config from '../../../config'
import { ApplicationRoles } from '../../../middleware'
import { findPaths, referPaths } from '../../../paths'
import type PersonService from '../../../services/personService'
import { personFactory } from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import PersonUtils from '../../../utils/personUtils'

jest.mock('../../../utils/personUtils')

describe('NewReferralsPeopleController', () => {
  const username = 'VBASHIR123'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const personService = createMock<PersonService>({})
  const courseOfferingId = 'A-COURSE-OFFERING-ID'

  let controller: NewReferralsPeopleController

  beforeEach(() => {
    request = createMock<Request>({ user: { username } })
    response = Helpers.createMockResponseWithCaseloads()
    controller = new NewReferralsPeopleController(personService)
  })

  describe('show', () => {
    const person = personFactory.build({
      name: 'Del Hatton',
    })

    it('renders the show template with the found Person', async () => {
      request.params.courseOfferingId = courseOfferingId

      personService.getPerson.mockResolvedValue(person)

      const mockPersonSummaryList = [{ key: { text: 'My Key' }, value: { text: 'My value' } }]
      ;(PersonUtils.summaryListRows as jest.Mock).mockReturnValue(mockPersonSummaryList)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/new/people/show', {
        courseOfferingId,
        hrefs: {
          back: referPaths.new.start({ courseOfferingId }),
          restart: findPaths.pniFind.personSearch({}),
        },
        pageHeading: "Confirm Del Hatton's details",
        pageTitleOverride: "Confirm person's details",
        personSummaryListRows: mockPersonSummaryList,
        prisonNumber: person.prisonNumber,
      })
    })

    describe('when the person service returns `null`', () => {
      it('redirects to the referrals new action with a flashed error message', async () => {
        const fakeId = 'NOT-A-REAL-ID'

        request.params.courseOfferingId = courseOfferingId
        request.params.prisonNumber = fakeId

        const serviceError = createError(404)
        personService.getPerson.mockRejectedValue(serviceError)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch({}))
        expect(request.flash).toHaveBeenCalledWith(
          'prisonNumberError',
          `No person with prison number '${fakeId}' found`,
        )
      })
    })

    describe('when caseTransferEnabled is true', () => {
      beforeEach(() => {
        request.params.courseOfferingId = courseOfferingId
        config.flags.caseTransferEnabled = true
      })

      describe('and the user has the required roles to view all prisoners', () => {
        it('calls `getPerson` with an empty caseloads array so the person can be searched for in all caseloads', async () => {
          response.locals.user.roles = [ApplicationRoles.ACP_PROGRAMME_TEAM, ApplicationRoles.ACP_REFERRER]

          personService.getPerson.mockResolvedValue(person)

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(personService.getPerson).toHaveBeenCalledWith(username, request.params.prisonNumber, [])
        })
      })

      describe('and the user does not have the required roles to view all prisoners', () => {
        it('calls `getPerson` with the user caseloads so the person can only be searched for in those caseloads', async () => {
          response.locals.user.roles = [ApplicationRoles.ACP_PROGRAMME_TEAM]

          personService.getPerson.mockResolvedValue(person)

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(personService.getPerson).toHaveBeenCalledWith(
            username,
            request.params.prisonNumber,
            response.locals.user.caseloads,
          )
        })
      })
    })
  })
})
