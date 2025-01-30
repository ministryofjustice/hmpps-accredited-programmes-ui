import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import RecommendedProgrammesController from './recommendedProgrammesController'
import { ApplicationRoles } from '../../middleware'
import { findPaths } from '../../paths'
import type { CourseService, PersonService } from '../../services'
import { caseloadFactory, courseFactory, personFactory } from '../../testutils/factories'
import { CourseUtils } from '../../utils'

jest.mock('../../utils/courseUtils')

const mockCourseUtils = CourseUtils as jest.Mocked<typeof CourseUtils>

describe('RecommendedProgrammesController', () => {
  const prisonNumber = 'A1234AA'
  const username = 'USERNAME'
  const caseloads = caseloadFactory.buildList(2)

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const courseService = createMock<CourseService>({})

  const person = personFactory.build({
    prisonNumber,
  })

  let controller: RecommendedProgrammesController

  beforeEach(() => {
    controller = new RecommendedProgrammesController(personService, courseService)
    request = createMock<Request>({
      session: {
        pniFindAndReferData: {
          prisonNumber,
        },
      },
    })
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
    const courseA = courseFactory.build({ name: 'Course A' })
    const courseB = courseFactory.build({ name: 'Course B' })
    const courseC = courseFactory.build({ name: 'Course C' })
    const courseD = courseFactory.build({ displayOnProgrammeDirectory: false, name: 'Course D' })
    const courses = [courseD, courseC, courseB, courseA]
    const sortedCourses = [courseA, courseB, courseC]

    beforeEach(() => {
      when(personService.getPerson).calledWith(username, prisonNumber).mockResolvedValue(person)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render the recommendedProgrammes template with the correct response locals', async () => {
      const programmePathway = 'HIGH_INTENSITY_BC'

      request.session.pniFindAndReferData = {
        prisonNumber,
        programmePathway,
      }

      when(courseService.getCourses).calledWith(username, { intensity: 'HIGH' }).mockResolvedValue(courses)

      await controller.show()(request, response, next)

      expect(request.session.pniFindAndReferData).toEqual({
        prisonNumber,
        programmePathway,
      })
      expect(mockCourseUtils.presentCourse).toHaveBeenCalledTimes(3)
      expect(response.render).toHaveBeenCalledWith('find/recommendedProgrammes', {
        courses: sortedCourses.map(mockCourseUtils.presentCourse),
        decisionText: ['These programmes are recommended for people with high or very high risks and needs.'],
        hrefs: {
          back: findPaths.pniFind.recommendedPathway.pattern,
        },
        pageHeading: 'Recommended: high intensity Accredited Programmes',
        programmePathway,
      })
    })

    describe('when the `programmePathway` is `MODERATE_INTENSITY_BC`', () => {
      it('should render the recommendedProgrammes template with the correct response locals', async () => {
        const programmePathway = 'MODERATE_INTENSITY_BC'

        request.session.pniFindAndReferData = {
          prisonNumber,
          programmePathway,
        }

        when(courseService.getCourses).calledWith(username, { intensity: 'MODERATE' }).mockResolvedValue(courses)

        await controller.show()(request, response, next)

        expect(request.session.pniFindAndReferData).toEqual({
          prisonNumber,
          programmePathway,
        })
        expect(mockCourseUtils.presentCourse).toHaveBeenCalledTimes(3)
        expect(response.render).toHaveBeenCalledWith('find/recommendedProgrammes', {
          courses: sortedCourses.map(mockCourseUtils.presentCourse),
          decisionText: ['These programmes are recommended for people with medium risks and needs.'],
          hrefs: {
            back: findPaths.pniFind.recommendedPathway.pattern,
          },
          pageHeading: 'Recommended: moderate intensity Accredited Programmes',
          programmePathway,
        })
      })
    })

    describe('when the `programmePathway` is `ALTERNATIVE_PATHWAY`', () => {
      it('should render the recommendedProgrammes template with the correct response locals', async () => {
        const programmePathway = 'ALTERNATIVE_PATHWAY'

        request.session.pniFindAndReferData = {
          prisonNumber,
          programmePathway,
        }

        when(courseService.getCourses).calledWith(username, {}).mockResolvedValue(courses)

        await controller.show()(request, response, next)

        expect(request.session.pniFindAndReferData).toEqual({
          prisonNumber,
          programmePathway,
        })
        expect(mockCourseUtils.presentCourse).toHaveBeenCalledTimes(3)
        expect(response.render).toHaveBeenCalledWith('find/recommendedProgrammes', {
          courses: sortedCourses.map(mockCourseUtils.presentCourse),
          decisionText: [
            `Accredited Programmes are not recommended for people who may not be eligible based on risks and needs, like ${person.name}`,
            'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
          ],
          hrefs: {
            back: findPaths.pniFind.recommendedPathway.pattern,
          },
          pageHeading: 'Accredited Programmes: not recommended',
          programmePathway,
        })
      })
    })

    describe('when the `programmePathway` is `MISSING_INFORMATION`', () => {
      it('should render the recommendedProgrammes template with the correct response locals', async () => {
        const programmePathway = 'MISSING_INFORMATION'

        request.session.pniFindAndReferData = {
          prisonNumber,
          programmePathway,
        }

        when(courseService.getCourses).calledWith(username, {}).mockResolvedValue(courses)

        await controller.show()(request, response, next)

        expect(request.session.pniFindAndReferData).toEqual({
          prisonNumber,
          programmePathway,
        })
        expect(mockCourseUtils.presentCourse).toHaveBeenCalledTimes(3)
        expect(response.render).toHaveBeenCalledWith('find/recommendedProgrammes', {
          courses: sortedCourses.map(mockCourseUtils.presentCourse),
          decisionText: [
            `${person.name} may not be eligible for these programmes based on risks and needs. Information is missing from the risk and need assessment.`,
            'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
          ],
          hrefs: {
            back: findPaths.pniFind.recommendedPathway.pattern,
          },
          pageHeading: 'Accredited Programmes',
          programmePathway,
          warningText: 'Update layer 3 assessment scores',
        })
      })
    })

    describe('when the `programmePathway` is `UNKNOWN`', () => {
      it('should render the recommendedProgrammes template with the correct response locals', async () => {
        const programmePathway = 'UNKNOWN'

        request.session.pniFindAndReferData = {
          prisonNumber,
          programmePathway,
        }

        when(courseService.getCourses).calledWith(username, {}).mockResolvedValue(courses)

        await controller.show()(request, response, next)

        expect(request.session.pniFindAndReferData).toEqual({
          prisonNumber,
          programmePathway,
        })
        expect(mockCourseUtils.presentCourse).toHaveBeenCalledTimes(3)
        expect(response.render).toHaveBeenCalledWith('find/recommendedProgrammes', {
          courses: sortedCourses.map(mockCourseUtils.presentCourse),
          decisionText: [
            `${person.name} may not be eligible for these programmes based on risks and needs. Information is missing from the layer 3 assessment.`,
            'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
          ],
          hrefs: {
            back: findPaths.pniFind.recommendedPathway.pattern,
          },
          pageHeading: 'Accredited Programmes',
          programmePathway,
          warningText: 'Update risk and need assessment scores',
        })
      })
    })

    describe('when there is no `prisonNumber` in the session', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.prisonNumber

        await controller.show()(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when there is no `programmePathway` in the session', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.programmePathway

        await controller.show()(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })
  })
})
