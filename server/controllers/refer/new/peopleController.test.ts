import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import NewReferralsPeopleController from './peopleController'
import { referPaths } from '../../../paths'
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

  describe('find', () => {
    it('redirects to the show action with the prisonNumber as a param', async () => {
      const prisonNumber = 'ANUMB5R'

      request.params.courseOfferingId = courseOfferingId
      request.body.prisonNumber = prisonNumber

      const requestHandler = controller.find()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.people.show({ courseOfferingId, prisonNumber }))
    })

    describe('when the prison number is an empty string', () => {
      it('redirects to the referrals new action with a flashed error message', async () => {
        const prisonNumber = ''

        request.params.courseOfferingId = courseOfferingId
        request.body.prisonNumber = prisonNumber

        const requestHandler = controller.find()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.new({ courseOfferingId }))
        expect(request.flash).toHaveBeenCalledWith('prisonNumberError', 'Please enter a prison number')
      })
    })
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
        pageHeading: "Confirm Del Hatton's details",
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

        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.new({ courseOfferingId }))
        expect(request.flash).toHaveBeenCalledWith(
          'prisonNumberError',
          `No person with a prison number '${fakeId}' was found`,
        )
      })
    })
  })
})
