import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import CaseListController from './caseListController'
import { assessPaths } from '../../paths'
import type { CourseService, ReferralService } from '../../services'
import { courseFactory, referralSummaryFactory } from '../../testutils/factories'
import { CaseListUtils, PathUtils } from '../../utils'
import type { Paginated, ReferralSummary } from '@accredited-programmes/models'

jest.mock('../../utils/pathUtils')

describe('CaseListController', () => {
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'
  const courseNameSlug = 'lime-course'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const referralService = createMock<ReferralService>({})
  let paginatedReferralSummaries: Paginated<ReferralSummary>

  let controller: CaseListController

  const courses = [courseFactory.build({ name: 'Orange Course' }), courseFactory.build({ name: 'Lime Course' })]

  beforeEach(() => {
    const referralSummaries = referralSummaryFactory.buildList(3)
    paginatedReferralSummaries = {
      content: referralSummaries,
      pageIsEmpty: false,
      pageNumber: 0,
      pageSize: 10,
      totalElements: referralSummaries.length,
      totalPages: 1,
    }

    referralService.getReferralSummaries.mockResolvedValue(paginatedReferralSummaries)

    controller = new CaseListController(courseService, referralService)

    request = createMock<Request>({ user: { username } })
    response = createMock<Response>({ locals: { user: { activeCaseLoadId, username } } })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('indexRedirect', () => {
    it('redirects to the first course case list page', async () => {
      when(courseService.getCoursesByOrganisation).calledWith(username, activeCaseLoadId).mockResolvedValue(courses)

      const requestHandler = controller.indexRedirect()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(assessPaths.caseList.show({ courseName: 'lime-course' }))
    })

    describe('when there are no courses', () => {
      it('throws a 404 error', async () => {
        when(courseService.getCoursesByOrganisation).calledWith(username, activeCaseLoadId).mockResolvedValue([])

        const requestHandler = controller.indexRedirect()
        const expectedError = createError(404, 'No courses found.')

        expect(() => requestHandler(request, response, next)).rejects.toThrow(expectedError)
      })
    })
  })

  describe('filter', () => {
    const redirectPathBase = assessPaths.caseList.show({ courseName: courseNameSlug })
    const pathWithQuery = 'path-with-query'
    const audience = 'General violence offence'
    const status = 'ASSESSMENT_STARTED'

    beforeEach(() => {
      ;(PathUtils.pathWithQuery as jest.Mock).mockReturnValue(pathWithQuery)

      request.params = { courseName: courseNameSlug }
    })

    describe('when `req.body.audience` and `req.body.status` are provided', () => {
      it('asks PathUtils to generate a path with both as query params - audience renamed "strand" - and redirects to the result', async () => {
        request.body.audience = audience
        request.body.status = status

        const requestHandler = controller.filter()
        await requestHandler(request, response, next)

        expect(PathUtils.pathWithQuery).toHaveBeenLastCalledWith(redirectPathBase, [
          { key: 'strand', value: audience },
          { key: 'status', value: status },
        ])
        expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
      })
    })

    describe('when `req.body.audience` is undefined', () => {
      it('asks PathUtils to generate a path with status as a query param and redirects to the result', async () => {
        request.body.audience = undefined
        request.body.status = status

        const requestHandler = controller.filter()
        await requestHandler(request, response, next)

        expect(PathUtils.pathWithQuery).toHaveBeenLastCalledWith(redirectPathBase, [{ key: 'status', value: status }])
        expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
      })
    })

    describe('when `req.body.status` is undefined', () => {
      it('asks PathUtils to generate a path with audience as a query param - renamed "strand" - and redirects to the result', async () => {
        request.body.audience = audience
        request.body.status = undefined

        const requestHandler = controller.filter()
        await requestHandler(request, response, next)

        expect(PathUtils.pathWithQuery).toHaveBeenLastCalledWith(redirectPathBase, [{ key: 'strand', value: audience }])
        expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
      })
    })

    describe('when `req.body.audience` and `req.body.status` are both `undefined`', () => {
      it('asks PathUtils to generate a path without any query params and redirects to the result', async () => {
        request.body.audience = undefined
        request.body.status = undefined

        const requestHandler = controller.filter()
        await requestHandler(request, response, next)

        expect(PathUtils.pathWithQuery).toHaveBeenLastCalledWith(redirectPathBase, [])
        expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
      })
    })
  })

  describe('show', () => {
    const sortedCourses = courses.sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

    beforeEach(() => {
      request.params = { courseName: courseNameSlug }

      when(courseService.getCoursesByOrganisation).calledWith(username, activeCaseLoadId).mockResolvedValue(courses)
    })

    it('renders the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
        action: assessPaths.caseList.filter({ courseName: courseNameSlug }),
        audienceSelectItems: CaseListUtils.audienceSelectItems(),
        pageHeading: 'Lime Course (LC)',
        primaryNavigationItems: CaseListUtils.primaryNavigationItems(request.path, sortedCourses),
        referralStatusSelectItems: CaseListUtils.statusSelectItems(),
        tableRows: CaseListUtils.tableRows(paginatedReferralSummaries.content),
      })

      expect(referralService.getReferralSummaries).toHaveBeenCalledWith(username, activeCaseLoadId, {
        audience: undefined,
        courseName: 'Lime Course',
        status: undefined,
      })
    })

    describe('when there are query parameters', () => {
      it('renders the show template with the correct response locals', async () => {
        request.query = {
          status: 'referral submitted',
          strand: 'general offence',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
          action: assessPaths.caseList.filter({ courseName: courseNameSlug }),
          audienceSelectItems: CaseListUtils.audienceSelectItems('general offence'),
          pageHeading: 'Lime Course (LC)',
          primaryNavigationItems: CaseListUtils.primaryNavigationItems(request.path, sortedCourses),
          referralStatusSelectItems: CaseListUtils.statusSelectItems('referral submitted'),
          tableRows: CaseListUtils.tableRows(paginatedReferralSummaries.content),
        })

        expect(referralService.getReferralSummaries).toHaveBeenCalledWith(username, activeCaseLoadId, {
          audience: 'General offence',
          courseName: 'Lime Course',
          status: 'REFERRAL_SUBMITTED',
        })
      })
    })

    describe('when the course name is not found', () => {
      it('throws a 404 error', async () => {
        request.params = { courseName: 'not-a-course' }

        const requestHandler = controller.show()
        const expectedError = createError(404, 'Not A Course not found.')

        await expect(() => requestHandler(request, response, next)).rejects.toThrow(expectedError)
        expect(referralService.getReferralSummaries).not.toHaveBeenCalled()
      })
    })
  })
})
