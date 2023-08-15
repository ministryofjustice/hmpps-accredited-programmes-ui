import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import PeopleController from './peopleController'
import type PersonService from '../../services/personService'
import { personFactory } from '../../testutils/factories'
import personUtils from '../../utils/personUtils'

jest.mock('../../utils/personUtils')

describe('PeopleController', () => {
  const token = 'SOME_TOKEN'
  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const personService = createMock<PersonService>({})

  let peopleController: PeopleController

  beforeEach(() => {
    peopleController = new PeopleController(personService)
  })

  describe('show', () => {
    const person = personFactory.build({
      name: 'Del Hatton',
    })

    it('renders the show template with the found Person', async () => {
      personService.getPerson.mockResolvedValue(person)

      const requestHandler = peopleController.show()

      const mockPersonSummaryList = [{ key: { text: 'My Key' }, value: { text: 'My value' } }]
      ;(personUtils.summaryListRows as jest.Mock).mockReturnValue(mockPersonSummaryList)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/people/show', {
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
