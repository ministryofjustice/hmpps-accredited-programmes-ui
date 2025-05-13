import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import HspNotEligibleController from './hspNotEligibleController'
import { findPaths } from '../../paths'
import type { CourseService, PersonService } from '../../services'
import { courseFactory, personFactory } from '../../testutils/factories'
import { CourseUtils } from '../../utils'

describe('HspNotEligibleController', () => {
  const username = 'SOME_USER'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})

  let controller: HspNotEligibleController

  const hspCourse = courseFactory.build({ name: 'Healthy Sex Programme' })
  const person = personFactory.build({ name: 'Del Hatton' })

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId: hspCourse.id },
      session: {
        pniFindAndReferData: {
          prisonNumber: person.prisonNumber,
          programmePathway: 'HIGH_INTENSITY_BC',
        },
      },
      user: { username },
    })

    response = createMock<Response>({})
    controller = new HspNotEligibleController(courseService, personService)

    when(courseService.getCourse).calledWith(username, hspCourse.id).mockResolvedValue(hspCourse)
    when(personService.getPerson).calledWith(username, person.prisonNumber).mockResolvedValue(person)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('show', () => {
    it('should render the HSP Not eligible page with the correct data', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courses/hsp/notEligible/show', {
        hrefs: {
          back: findPaths.hsp.details.show({ courseId: hspCourse.id }),
          continueReferral: findPaths.hsp.reason.show({ courseId: hspCourse.id }),
          programmeIndex: findPaths.pniFind.recommendedProgrammes({}),
        },
        pageHeading: 'Del Hatton may not be eligible for Healthy Sex Programme',
        pageTitleOverride: 'Not Eligible for HSP',
        personName: person.name,
      })
    })

    describe('when there is no `prisonNumber` in `session.pniFindAndReferData`', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.prisonNumber

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when there is no `programmePathway` in `session.pniFindAndReferData`', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.programmePathway

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when the course is not an HSP course', () => {
      it('should redirect to the person search page', async () => {
        jest.spyOn(CourseUtils, 'isHsp').mockReturnValue(false)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })
  })
})
