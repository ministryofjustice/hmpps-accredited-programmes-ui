import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import PeopleController from './peopleController'
import { referPaths } from '../../paths'
import type PersonService from '../../services/personService'
import { personFactory } from '../../testutils/factories'
import PersonUtils from '../../utils/personUtils'

jest.mock('../../utils/personUtils')

describe('PeopleController', () => {
  const token = 'SOME_TOKEN'
  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const personService = createMock<PersonService>({})
  const courseOfferingId = 'A-COURSE-OFFERING-ID'

  let peopleController: PeopleController

  beforeEach(() => {
    peopleController = new PeopleController(personService)
  })

  describe('find', () => {
    it('redirects to the show action with the prisonNumber as a param', async () => {
      const requestHandler = peopleController.find()

      const prisonNumber = 'ANUMB5R'

      request.params.courseOfferingId = courseOfferingId
      request.body.prisonNumber = prisonNumber

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.people.show({ courseOfferingId, prisonNumber }))
    })

    describe('when the prison number is an empty string', () => {
      it('redirects to the referrals new action with a flashed error message', async () => {
        const requestHandler = peopleController.find()

        const prisonNumber = ''

        request.params.courseOfferingId = courseOfferingId
        request.body.prisonNumber = prisonNumber

        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.new({ courseOfferingId }))
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

      const requestHandler = peopleController.show()

      const mockPersonSummaryList = [{ key: { text: 'My Key' }, value: { text: 'My value' } }]
      ;(PersonUtils.summaryListRows as jest.Mock).mockReturnValue(mockPersonSummaryList)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/people/show', {
        courseOfferingId,
        pageHeading: "Confirm Del Hatton's details",
        personSummaryListRows: mockPersonSummaryList,
        prisonNumber: person.prisonNumber,
      })
    })

    describe('when the person service returns `null`', () => {
      it('redirects to the referrals new action with a flashed error message', async () => {
        const fakeId = 'NOT-A-REAL-ID'

        request.params.prisonNumber = fakeId
        personService.getPerson.mockResolvedValue(null)

        const requestHandler = peopleController.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.new({ courseOfferingId }))
        expect(request.flash).toHaveBeenCalledWith(
          'prisonNumberError',
          `No person with a prison number '${fakeId}' was found`,
        )
      })
    })
  })
})
