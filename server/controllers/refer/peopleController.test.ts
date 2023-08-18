import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

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
  const courseId = 'A-COURSE-ID'
  const courseOfferingId = 'A-COURSE-OFFERING-ID'

  let peopleController: PeopleController

  beforeEach(() => {
    peopleController = new PeopleController(personService)
  })

  describe('find', () => {
    it('redirects to the show action with the prisonNumber as a param', async () => {
      const requestHandler = peopleController.find()

      const prisonNumber = 'ANUMB5R'

      request.params.courseId = courseId
      request.params.courseOfferingId = courseOfferingId
      request.body.prisonNumber = prisonNumber

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        referPaths.people.show({ courseId, courseOfferingId, prisonNumber }),
      )
    })
  })

  describe('show', () => {
    const person = personFactory.build({
      name: 'Del Hatton',
    })

    it('renders the show template with the found Person', async () => {
      request.params.courseId = courseId
      request.params.courseOfferingId = courseOfferingId

      personService.getPerson.mockResolvedValue(person)

      const requestHandler = peopleController.show()

      const mockPersonSummaryList = [{ key: { text: 'My Key' }, value: { text: 'My value' } }]
      ;(PersonUtils.summaryListRows as jest.Mock).mockReturnValue(mockPersonSummaryList)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/people/show', {
        courseId,
        courseOfferingId,
        pageHeading: "Confirm Del Hatton's details",
        personSummaryListRows: mockPersonSummaryList,
      })
    })

    it('throws an error if the user is not found', async () => {
      personService.getPerson.mockResolvedValue(null)

      const requestHandler = peopleController.show()

      const expectedError = createError(404)

      expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
    })
  })
})
