import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { when } from 'jest-when'

import PersonSearchController from './personSearchController'
import { ApplicationRoles } from '../../middleware'
import { findPaths } from '../../paths'
import type { PersonService } from '../../services'
import { caseloadFactory, personFactory } from '../../testutils/factories'
import { FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('PersonSearchController', () => {
  const username = 'USERNAME'
  const caseloads = caseloadFactory.buildList(2)

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let controller: PersonSearchController

  beforeEach(() => {
    controller = new PersonSearchController(personService)
    request = createMock<Request>()
    response = createMock<Response>({
      locals: {
        user: {
          caseloads,
          roles: [ApplicationRoles.ACP_REFERRER, ApplicationRoles.ACP_PROGRAMME_TEAM],
          username,
        },
      },
    })
  })

  describe('show', () => {
    it('should render the person search page', async () => {
      controller.show()(request, response, next)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['prisonNumber'])
      expect(response.render).toHaveBeenCalledWith('find/personSearch', {
        pageHeading: 'Find recommended programmes',
      })
    })
  })

  describe('submit', () => {
    const prisonNumber = 'A1234AA'
    const person = personFactory.build({ prisonNumber })

    it('should redirect to the recommended pathway page', async () => {
      when(personService.getPerson).calledWith(username, prisonNumber, []).mockResolvedValue(person)

      request.body = { prisonNumber }

      await controller.submit()(request, response, next)

      expect(request.session.pniFindAndReferData).toEqual({ prisonNumber })
      expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.recommendedPathway.pattern)
    })

    describe('when the user does not have the required roles to search all prisoners', () => {
      it('should call getPerson with the user’s caseloads', async () => {
        when(personService.getPerson).calledWith(username, prisonNumber, caseloads).mockResolvedValue(person)

        request.body = { prisonNumber }
        response.locals.user.roles = [ApplicationRoles.ACP_PROGRAMME_TEAM]

        await controller.submit()(request, response, next)

        expect(personService.getPerson).toHaveBeenCalledWith(username, prisonNumber, caseloads)
      })
    })

    describe('when the user does not enter a prison number', () => {
      it('should redirect to the same page with a flash message', async () => {
        request.body = { prisonNumber: '' }

        await controller.submit()(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('prisonNumberError', 'Enter a prison number')
        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when the person service returns a 404 for the provided prison number', () => {
      it('should redirect to the same page with a flash message', async () => {
        const serviceError = createHttpError(404)

        when(personService.getPerson).calledWith(username, prisonNumber, []).mockRejectedValue(serviceError)

        request.body = { prisonNumber }

        await controller.submit()(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'prisonNumberError',
          `No person with prison number '${prisonNumber}' found`,
        )
        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when the person service throws an error', () => {
      it('should rethrow the error', async () => {
        const serviceError = createHttpError(500)

        when(personService.getPerson).calledWith(username, prisonNumber, []).mockRejectedValue(serviceError)

        request.body = { prisonNumber }

        await expect(controller.submit()(request, response, next)).rejects.toThrow(serviceError)
      })
    })
  })
})
