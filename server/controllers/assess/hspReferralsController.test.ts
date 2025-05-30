import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import HspReferralsController from './hspReferralsController'
import { assessPaths } from '../../paths'
import type { CourseService } from '../../services'
import { courseFactory } from '../../testutils/factories'

const username = 'USERNAME'
const activeCaseLoadId = 'MDI'
const originalUrl = '/original-url'
const referralStatusGroup = 'open'

let request: DeepMocked<Request>
let response: DeepMocked<Response>
const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

const courseService = createMock<CourseService>({})

let controller: HspReferralsController

const orangeCourse = courseFactory.build({ name: 'Orange Course' })
const hspCourse = courseFactory.build({ audience: 'Sexual offence', name: 'Healthy Sex Programme' })
const courses = [orangeCourse, hspCourse]

beforeEach(() => {
  controller = new HspReferralsController(courseService)

  request = createMock<Request>({ flash: jest.fn().mockReturnValue([]), originalUrl, user: { username } })
  response = createMock<Response>({ locals: { user: { activeCaseLoadId, username } } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('indexRedirect', () => {
  it('redirects to the first course case list page after they are sorted alphabetically by name', async () => {
    when(courseService.getCourses).calledWith(username, { intensity: 'HIGH' }).mockResolvedValue(courses)

    const requestHandler = controller.show()
    await requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith(
      assessPaths.caseList.show({ courseId: hspCourse.id, referralStatusGroup }),
    )
  })

  it('redirect to homepage when no hsp course is found', async () => {
    when(courseService.getCourses).calledWith(username, { intensity: 'HIGH' }).mockResolvedValue([orangeCourse])

    const requestHandler = controller.show()
    await requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/')
  })
})
