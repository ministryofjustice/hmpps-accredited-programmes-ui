import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import { type NextFunction, type Request, type Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import AssessCaseListController from './caseListController'
import { assessPaths } from '../../paths'
import type { CourseService, ReferralService } from '../../services'
import { courseFactory, referralViewFactory } from '../../testutils/factories'
import { CaseListUtils, PaginationUtils, PathUtils } from '../../utils'
import type { Paginated, ReferralView } from '@accredited-programmes/models'
import type {
  CaseListColumnHeader,
  GovukFrontendPaginationWithItems,
  MojFrontendNavigationItem,
  QueryParam,
} from '@accredited-programmes/ui'
import type { GovukFrontendSelectItem, GovukFrontendTableRow } from '@govuk-frontend'

jest.mock('../../utils/paginationUtils')
jest.mock('../../utils/pathUtils')
jest.mock('../../utils/referrals/caseListUtils')

describe('AssessCaseListController', () => {
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'
  const courseNameSlug = 'lime-course'
  const pathWithQuery = 'path-with-query'
  const queryParamsExcludingPage: Array<QueryParam> = []
  const queryParamsExcludingSort: Array<QueryParam> = []

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const referralService = createMock<ReferralService>({})

  let controller: AssessCaseListController

  const courses = [courseFactory.build({ name: 'Orange Course' }), courseFactory.build({ name: 'Lime Course' })]

  beforeEach(() => {
    controller = new AssessCaseListController(courseService, referralService)

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
    const audience = 'General violence offence'
    const status = 'ASSESSMENT_STARTED'

    beforeEach(() => {
      ;(PathUtils.pathWithQuery as jest.Mock).mockReturnValue(pathWithQuery)
      ;(CaseListUtils.queryParamsExcludingPage as jest.Mock).mockReturnValue(queryParamsExcludingPage)

      request.params = { courseName: courseNameSlug }
    })

    it('uses utils to generate a path to the show action with the request body converted to query params, then redirects there', async () => {
      request.body.audience = audience
      request.body.status = status

      const requestHandler = controller.filter()
      await requestHandler(request, response, next)

      expect(CaseListUtils.queryParamsExcludingPage)
      expect(PathUtils.pathWithQuery).toHaveBeenLastCalledWith(redirectPathBase, queryParamsExcludingPage)
      expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
    })
  })

  describe('show', () => {
    const sortedCourses = courses.sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
    let paginatedReferralViews: Paginated<ReferralView>
    const audienceSelectItems = 'aaa' as unknown as jest.Mocked<Array<GovukFrontendSelectItem>>
    const referralStatusSelectItems = 'bbb' as unknown as jest.Mocked<Array<GovukFrontendSelectItem>>
    const tableRows = 'ccc' as unknown as jest.Mocked<Array<GovukFrontendTableRow>>
    const primaryNavigationItems = 'ddd' as unknown as jest.Mocked<Array<MojFrontendNavigationItem>>
    const pagination = 'eee' as unknown as jest.Mocked<GovukFrontendPaginationWithItems>
    const tableHeadings = 'fff' as unknown as jest.Mocked<Array<CaseListColumnHeader>>
    const columnsToInclude: Array<CaseListColumnHeader> = [
      'Name / Prison number',
      'Conditional release date',
      'Parole eligibility date',
      'Tariff end date',
      'Programme strand',
      'Referral status',
    ]

    beforeEach(() => {
      request.params = { courseName: courseNameSlug }

      when(courseService.getCoursesByOrganisation).calledWith(username, activeCaseLoadId).mockResolvedValue(courses)

      const referralViews = referralViewFactory.buildList(3)
      paginatedReferralViews = {
        content: referralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 10,
        totalElements: referralViews.length,
        totalPages: 1,
      }
      referralService.getReferralViews.mockResolvedValue(paginatedReferralViews)
      ;(CaseListUtils.audienceSelectItems as jest.Mock).mockReturnValue(audienceSelectItems)
      ;(CaseListUtils.primaryNavigationItems as jest.Mock).mockReturnValue(primaryNavigationItems)
      ;(CaseListUtils.queryParamsExcludingPage as jest.Mock).mockReturnValue(queryParamsExcludingPage)
      ;(CaseListUtils.queryParamsExcludingSort as jest.Mock).mockReturnValue(queryParamsExcludingSort)
      ;(CaseListUtils.sortableTableHeadings as jest.Mock).mockReturnValue(tableHeadings)
      ;(CaseListUtils.statusSelectItems as jest.Mock).mockReturnValue(referralStatusSelectItems)
      ;(CaseListUtils.tableRows as jest.Mock).mockReturnValue(tableRows)
      ;(PaginationUtils.pagination as jest.Mock).mockReturnValue(pagination)
      ;(PathUtils.pathWithQuery as jest.Mock).mockReturnValue(pathWithQuery)
    })

    it('renders the show template with the correct response locals', async () => {
      const apiStatusQuery = 'ASSESSMENT_STARTED,AWAITING_ASSESSMENT,REFERRAL_SUBMITTED'

      ;(CaseListUtils.uiToApiAudienceQueryParam as jest.Mock).mockReturnValue(undefined)
      ;(CaseListUtils.uiToApiStatusQueryParam as jest.Mock).mockReturnValue(apiStatusQuery)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/caseList/assess/show', {
        action: assessPaths.caseList.filter({ courseName: courseNameSlug }),
        audienceSelectItems,
        pageHeading: 'Lime Course (LC)',
        pagination,
        primaryNavigationItems,
        referralStatusSelectItems,
        tableHeadings,
        tableRows,
      })
      expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(undefined)
      expect(CaseListUtils.uiToApiStatusQueryParam).toHaveBeenCalledWith(apiStatusQuery.toLowerCase())
      expect(referralService.getReferralViews).toHaveBeenCalledWith(username, activeCaseLoadId, {
        audience: undefined,
        courseName: 'Lime Course',
        status: apiStatusQuery,
      })
      expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
      )
      expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
        request.path,
        queryParamsExcludingPage,
        paginatedReferralViews.pageNumber,
        paginatedReferralViews.totalPages,
      )
      expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
        assessPaths.caseList.show({ courseName: courseNameSlug }),
        queryParamsExcludingSort,
      )
      expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(undefined)
      expect(CaseListUtils.primaryNavigationItems).toHaveBeenCalledWith(request.path, courses)
      expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
        pathWithQuery,
        {
          audience: 'Programme strand',
          conditionalReleaseDate: 'Conditional release date',
          paroleEligibilityDate: 'Parole eligibility date',
          status: 'Referral status',
          surname: 'Name / Prison number',
          tariffExpiryDate: 'Tariff end date',
        },
        undefined,
        undefined,
      )
      expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(undefined)
      expect(CaseListUtils.tableRows).toHaveBeenCalledWith(paginatedReferralViews.content, columnsToInclude)
    })

    describe('when there are query parameters', () => {
      it('renders the show template with the correct response locals', async () => {
        const uiAudienceQueryParam = 'general offence'
        const uiSortColumnQueryParam = 'surname'
        const uiSortDirectionQueryParam = 'ascending'
        const uiStatusQueryParam = 'referral submitted'

        request.query = {
          sortColumn: uiSortColumnQueryParam,
          sortDirection: uiSortDirectionQueryParam,
          status: uiStatusQueryParam,
          strand: uiAudienceQueryParam,
        }

        const apiAudienceQueryParam = 'General offence'
        const apiStatusQueryParam = 'REFERRAL_SUBMITTED'
        ;(CaseListUtils.uiToApiAudienceQueryParam as jest.Mock).mockReturnValue(apiAudienceQueryParam)
        ;(CaseListUtils.uiToApiStatusQueryParam as jest.Mock).mockReturnValue(apiStatusQueryParam)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/assess/show', {
          action: assessPaths.caseList.filter({ courseName: courseNameSlug }),
          audienceSelectItems: CaseListUtils.audienceSelectItems('general offence'),
          pageHeading: 'Lime Course (LC)',
          pagination,
          primaryNavigationItems: CaseListUtils.primaryNavigationItems(request.path, sortedCourses),
          referralStatusSelectItems: CaseListUtils.statusSelectItems('referral submitted'),
          tableHeadings,
          tableRows: CaseListUtils.tableRows(paginatedReferralViews.content, columnsToInclude),
        })
        expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(uiAudienceQueryParam)
        expect(CaseListUtils.uiToApiStatusQueryParam).toHaveBeenCalledWith(uiStatusQueryParam)
        expect(referralService.getReferralViews).toHaveBeenCalledWith(username, activeCaseLoadId, {
          audience: apiAudienceQueryParam,
          courseName: 'Lime Course',
          sortColumn: uiSortColumnQueryParam,
          sortDirection: uiSortDirectionQueryParam,
          status: apiStatusQueryParam,
        })
        expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
          uiAudienceQueryParam,
          uiStatusQueryParam,
          uiSortColumnQueryParam,
          uiSortDirectionQueryParam,
        )
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          queryParamsExcludingPage,
          paginatedReferralViews.pageNumber,
          paginatedReferralViews.totalPages,
        )
        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          assessPaths.caseList.show({ courseName: courseNameSlug }),
          queryParamsExcludingSort,
        )
        expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(uiAudienceQueryParam)
        expect(CaseListUtils.primaryNavigationItems).toHaveBeenCalledWith(request.path, courses)
        expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
          pathWithQuery,
          {
            audience: 'Programme strand',
            conditionalReleaseDate: 'Conditional release date',
            paroleEligibilityDate: 'Parole eligibility date',
            status: 'Referral status',
            surname: 'Name / Prison number',
            tariffExpiryDate: 'Tariff end date',
          },
          uiSortColumnQueryParam,
          uiSortDirectionQueryParam,
        )
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(uiStatusQueryParam)
        expect(CaseListUtils.tableRows).toHaveBeenCalledWith(paginatedReferralViews.content, columnsToInclude)
      })
    })

    describe('when the course name is not found', () => {
      it('throws a 404 error', async () => {
        request.params = { courseName: 'not-a-course' }

        const requestHandler = controller.show()
        const expectedError = createError(404, 'Not A Course not found.')

        await expect(() => requestHandler(request, response, next)).rejects.toThrow(expectedError)
        expect(referralService.getReferralViews).not.toHaveBeenCalled()
      })
    })
  })
})
