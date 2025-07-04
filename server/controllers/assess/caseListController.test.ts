import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import { type NextFunction, type Request, type Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import AssessCaseListController from './caseListController'
import { assessPaths } from '../../paths'
import type { CourseService, ReferenceDataService, ReferralService } from '../../services'
import {
  audienceFactory,
  courseFactory,
  referralStatusRefDataFactory,
  referralViewFactory,
} from '../../testutils/factories'
import { CaseListUtils, PaginationUtils, PathUtils } from '../../utils'
import type { Paginated, ReferralView } from '@accredited-programmes/models'
import type {
  CaseListColumnHeader,
  GovukFrontendPaginationWithItems,
  MojFrontendNavigationItem,
  QueryParam,
} from '@accredited-programmes/ui'
import type { GovukFrontendSelectItem, GovukFrontendTableHeadElement, GovukFrontendTableRow } from '@govuk-frontend'

jest.mock('../../utils/paginationUtils')
jest.mock('../../utils/pathUtils')
jest.mock('../../utils/referrals/caseListUtils')

const mockCaseListUtils = CaseListUtils as jest.Mocked<typeof CaseListUtils>

describe('AssessCaseListController', () => {
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'
  const originalUrl = '/original-url'
  const referralStatusGroup = 'open'
  const pathWithQuery = 'path-with-query'
  const queryParamsExcludingPage: Array<QueryParam> = []
  const queryParamsExcludingSort: Array<QueryParam> = []

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const referralService = createMock<ReferralService>({})
  const referenceDataService = createMock<ReferenceDataService>({})

  let controller: AssessCaseListController

  const orangeCourse = courseFactory.build({ name: 'Orange Course' })
  const limeCourse = courseFactory.build({ audience: 'Gang offence', name: 'Lime Course' })
  const limeCourseAudiences = audienceFactory.buildList(2)
  const courses = [orangeCourse, limeCourse]

  beforeEach(() => {
    controller = new AssessCaseListController(courseService, referralService, referenceDataService)

    request = createMock<Request>({ flash: jest.fn().mockReturnValue([]), originalUrl, user: { username } })
    response = createMock<Response>({ locals: { user: { activeCaseLoadId, username } } })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('indexRedirect', () => {
    it('redirects to the first course case list page after they are sorted alphabetically by name', async () => {
      when(courseService.getCoursesByOrganisation).calledWith(username, activeCaseLoadId).mockResolvedValue(courses)

      const requestHandler = controller.indexRedirect()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup }),
      )
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
    const redirectPathBase = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup })
    const audience = 'General violence offence'
    const nameOrId = 'Hatton'
    const status = 'ASSESSMENT_STARTED'

    beforeEach(() => {
      ;(PathUtils.pathWithQuery as jest.Mock).mockReturnValue(pathWithQuery)
      mockCaseListUtils.queryParamsExcludingPage.mockReturnValue(queryParamsExcludingPage)

      request.params = { courseId: limeCourse.id, referralStatusGroup }
    })

    it('uses utils to generate a path to the show action with the request body converted to query params, then redirects there', async () => {
      request.body.audience = 'General violence offence::hasLdc=true'
      request.body.nameOrId = nameOrId
      request.body.status = status

      const requestHandler = controller.filter()
      await requestHandler(request, response, next)

      expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenCalledWith(
        audience,
        status,
        undefined,
        undefined,
        nameOrId,
        'true',
      )
      expect(PathUtils.pathWithQuery).toHaveBeenLastCalledWith(redirectPathBase, queryParamsExcludingPage)
      expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
    })

    it('should redirect back to the page with a flash message when filters are applied with no selections', async () => {
      request.body.audience = ''
      request.body.status = ''
      request.body.nameOrId = ''

      const requestHandler = controller.filter()
      await requestHandler(request, response, next)

      expect(CaseListUtils.queryParamsExcludingPage).not.toHaveBeenCalled()
      expect(request.flash).toHaveBeenCalledWith('audienceError', 'Choose a filter')
      expect(request.flash).toHaveBeenCalledWith('nameOrIdError', 'Enter a name or prison number')
      expect(response.redirect).toHaveBeenCalledWith(redirectPathBase)
    })
  })

  describe('show', () => {
    let openPaginatedReferralViews: Paginated<ReferralView>
    let closedPaginatedReferralViews: Paginated<ReferralView>
    const referralStatusSelectItems = 'bbb' as unknown as jest.Mocked<Array<GovukFrontendSelectItem>>
    const tableRows = 'ccc' as unknown as jest.Mocked<Array<GovukFrontendTableRow>>
    const primaryNavigationItems = 'ddd' as unknown as jest.Mocked<Array<MojFrontendNavigationItem>>
    const pagination = 'eee' as unknown as jest.Mocked<GovukFrontendPaginationWithItems>
    const subNavigationItems = [
      { active: true, href: 'open', text: 'Open referrals' },
      { active: false, href: 'closed', text: 'Closed referrals' },
    ]
    const tableHeadings = 'fff' as unknown as jest.Mocked<Array<GovukFrontendTableHeadElement>>
    const columnsToInclude: Array<CaseListColumnHeader> = [
      'Name and prison number',
      'Location',
      'Earliest release date',
      'Sentence type',
      'Programme strand',
      'Referral status',
    ]
    const closedReferralStatuses = referralStatusRefDataFactory.buildList(2, { closed: true, draft: false })
    const draftReferralStatuses = referralStatusRefDataFactory.buildList(2, { closed: false, draft: true })
    const openReferralStatuses = referralStatusRefDataFactory.buildList(2, { closed: false, draft: false })
    const audienceSelectItems = [
      {
        selected: false,
        text: 'All offences',
        value: 'all offences',
      },
      {
        selected: false,
        text: 'Extremism offence',
        value: 'extremism offence',
      },
      {
        selected: false,
        text: 'General offence',
        value: 'general offence',
      },
      { selected: false, text: 'Gang offence', value: 'gang offence' },
      {
        selected: false,
        text: 'General violence offence',
        value: 'general violence offence',
      },
      {
        selected: false,
        text: 'Intimate partner violence offence',
        value: 'intimate partner violence offence',
      },
      {
        selected: false,
        text: 'Sexual offence',
        value: 'sexual offence',
      },
    ]

    beforeEach(() => {
      request.params = { courseId: limeCourse.id, referralStatusGroup }

      when(courseService.getCoursesByOrganisation).calledWith(username, activeCaseLoadId).mockResolvedValue(courses)
      when(courseService.getCourseAudiences)
        .calledWith(username, { courseId: limeCourse.id })
        .mockResolvedValue(limeCourseAudiences)
      const openReferralViews = referralViewFactory.buildList(3, { status: 'referral_submitted' })
      const closedReferralViews = referralViewFactory.buildList(1, { status: 'programme_complete' })

      openPaginatedReferralViews = {
        content: openReferralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 10,
        totalElements: openReferralViews.length,
        totalPages: 1,
      }

      closedPaginatedReferralViews = {
        ...openPaginatedReferralViews,
        content: closedReferralViews,
        totalElements: closedReferralViews.length,
      }

      when(referralService.getReferralViews)
        .calledWith(username, activeCaseLoadId, expect.objectContaining({ statusGroup: 'open' }))
        .mockResolvedValue(openPaginatedReferralViews)
      when(referralService.getReferralViews)
        .calledWith(username, activeCaseLoadId, expect.objectContaining({ statusGroup: 'closed' }))
        .mockResolvedValue(closedPaginatedReferralViews)
      referenceDataService.getReferralStatuses.mockResolvedValue([
        ...closedReferralStatuses,
        ...draftReferralStatuses,
        ...openReferralStatuses,
      ])
      mockCaseListUtils.audienceSelectItems.mockReturnValue(audienceSelectItems)
      mockCaseListUtils.assessSubNavigationItems.mockReturnValue(subNavigationItems)
      mockCaseListUtils.primaryNavigationItems.mockReturnValue(primaryNavigationItems)
      mockCaseListUtils.queryParamsExcludingPage.mockReturnValue(queryParamsExcludingPage)
      mockCaseListUtils.queryParamsExcludingSort.mockReturnValue(queryParamsExcludingSort)
      mockCaseListUtils.sortableTableHeadings.mockReturnValue(tableHeadings)
      mockCaseListUtils.statusSelectItems.mockReturnValue(referralStatusSelectItems)
      mockCaseListUtils.tableRows.mockReturnValue(tableRows)
      ;(PaginationUtils.pagination as jest.Mock).mockReturnValue(pagination)
      ;(PathUtils.pathWithQuery as jest.Mock).mockReturnValue(pathWithQuery)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    describe('when the referral status group is "open"', () => {
      beforeEach(() => {
        request.params = { courseId: limeCourse.id, referralStatusGroup }
      })

      it('renders the show template with the correct response locals', async () => {
        expect(request.session.recentCaseListPath).toBeUndefined()
        courseService.getCourse.mockResolvedValue(limeCourse)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.recentCaseListPath).toBe(originalUrl)
        expect(response.render).toHaveBeenCalledWith('referrals/caseList/assess/show', {
          action: assessPaths.caseList.filter({ courseId: limeCourse.id, referralStatusGroup }),
          audienceSelectItems,
          pageHeading: 'Lime Course',
          pageTitleOverride: 'Manage open programme team referrals: Lime Course',
          pagination,
          primaryNavigationItems,
          referralStatusGroup,
          referralStatusSelectItems: {
            closed: referralStatusSelectItems,
            open: referralStatusSelectItems,
          },
          referralsFiltered: false,
          subNavigationItems,
          tableHeadings,
          tableRows,
        })
        expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(undefined)
        expect(referralService.getReferralViews).toHaveBeenCalledWith(username, activeCaseLoadId, {
          audience: undefined,
          courseName: 'Lime Course',
          hasLdcString: undefined,
          status: undefined,
          statusGroup: referralStatusGroup,
        })
        expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        )
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          queryParamsExcludingPage,
          openPaginatedReferralViews.pageNumber,
          openPaginatedReferralViews.totalPages,
        )
        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup }),
          queryParamsExcludingSort,
        )
        expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(limeCourseAudiences, false, undefined)
        expect(CaseListUtils.primaryNavigationItems).toHaveBeenCalledWith(request.path, courses)
        expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
          pathWithQuery,
          {
            audience: 'Programme strand',
            earliestReleaseDate: 'Earliest release date',
            location: 'Location',
            sentenceType: 'Sentence type',
            status: 'Referral status',
            surname: 'Name and prison number',
          },
          undefined,
          undefined,
        )
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(closedReferralStatuses, undefined, true)
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(openReferralStatuses, undefined, true)
        expect(CaseListUtils.assessSubNavigationItems).toHaveBeenCalledWith(
          request.path,
          limeCourse.id,
          {
            closed: 1,
            open: 3,
          },
          queryParamsExcludingPage,
        )
        expect(CaseListUtils.tableRows).toHaveBeenCalledWith(openPaginatedReferralViews.content, columnsToInclude)
      })

      describe('when there are query parameters and flash messages', () => {
        it('renders the show template with the correct response locals', async () => {
          const ldcStatusChangedMessage = 'LDC updated message'
          const uiAudienceQueryParam = 'general offence'
          const uiNameOrIdQueryParam = 'Hatton'
          const uiSortColumnQueryParam = 'surname'
          const uiSortDirectionQueryParam = 'ascending'
          const uiStatusQueryParam = 'REFERRAL_SUBMITTED'
          const uiHasLdcQueryParam = 'true'

          request.flash = jest.fn().mockReturnValue([ldcStatusChangedMessage])
          request.query = {
            hasLdc: uiHasLdcQueryParam,
            nameOrId: uiNameOrIdQueryParam,
            sortColumn: uiSortColumnQueryParam,
            sortDirection: uiSortDirectionQueryParam,
            status: uiStatusQueryParam,
            strand: uiAudienceQueryParam,
          }

          const apiAudienceQueryParam = 'General offence'
          const apiStatusQueryParam = 'REFERRAL_SUBMITTED'
          mockCaseListUtils.uiToApiAudienceQueryParam.mockReturnValue(apiAudienceQueryParam)
          courseService.getCourse.mockResolvedValue(limeCourse)
          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('referrals/caseList/assess/show', {
            action: assessPaths.caseList.filter({ courseId: limeCourse.id, referralStatusGroup }),
            audienceSelectItems: CaseListUtils.audienceSelectItems(limeCourseAudiences, false, 'general offence'),
            ldcStatusChangedMessage,
            nameOrId: uiNameOrIdQueryParam,
            pageHeading: 'Lime Course',
            pageTitleOverride: 'Manage open programme team referrals: Lime Course',
            pagination,
            primaryNavigationItems,
            referralStatusGroup,
            referralStatusSelectItems: {
              closed: referralStatusSelectItems,
              open: referralStatusSelectItems,
            },
            referralsFiltered: true,
            subNavigationItems,
            tableHeadings,
            tableRows: CaseListUtils.tableRows(openPaginatedReferralViews.content, columnsToInclude),
          })
          expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(uiAudienceQueryParam)
          expect(referralService.getReferralViews).toHaveBeenCalledWith(username, activeCaseLoadId, {
            audience: apiAudienceQueryParam,
            courseName: 'Lime Course',
            hasLdcString: uiHasLdcQueryParam,
            nameOrId: uiNameOrIdQueryParam,
            sortColumn: uiSortColumnQueryParam,
            sortDirection: uiSortDirectionQueryParam,
            status: apiStatusQueryParam,
            statusGroup: referralStatusGroup,
          })
          expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
            uiAudienceQueryParam,
            uiStatusQueryParam,
            uiSortColumnQueryParam,
            uiSortDirectionQueryParam,
            uiNameOrIdQueryParam,
            uiHasLdcQueryParam,
          )
          expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
            request.path,
            queryParamsExcludingPage,
            openPaginatedReferralViews.pageNumber,
            openPaginatedReferralViews.totalPages,
          )
          expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
            assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup }),
            queryParamsExcludingSort,
          )
          expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(
            limeCourseAudiences,
            false,
            uiAudienceQueryParam,
          )
          expect(CaseListUtils.primaryNavigationItems).toHaveBeenCalledWith(request.path, courses)
          expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
            pathWithQuery,
            {
              audience: 'Programme strand',
              earliestReleaseDate: 'Earliest release date',
              location: 'Location',
              sentenceType: 'Sentence type',
              status: 'Referral status',
              surname: 'Name and prison number',
            },
            uiSortColumnQueryParam,
            uiSortDirectionQueryParam,
          )
          expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(closedReferralStatuses, uiStatusQueryParam, true)
          expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(openReferralStatuses, uiStatusQueryParam, true)
          expect(CaseListUtils.assessSubNavigationItems).toHaveBeenCalledWith(
            request.path,
            limeCourse.id,
            { closed: 1, open: 3 },
            queryParamsExcludingPage,
          )
          expect(CaseListUtils.tableRows).toHaveBeenCalledWith(openPaginatedReferralViews.content, columnsToInclude)
        })
      })

      describe('when the course name is not found', () => {
        it('throws a 404 error', async () => {
          request.params = { courseId: 'not-a-course-id', referralStatusGroup }

          const requestHandler = controller.show()
          const expectedError = createError(404, 'Course with ID not-a-course-id not found.')

          await expect(() => requestHandler(request, response, next)).rejects.toThrow(expectedError)
          expect(referralService.getReferralViews).not.toHaveBeenCalled()
        })
      })
    })

    describe('when the referral status group is "closed"', () => {
      beforeEach(() => {
        request.params = { courseId: limeCourse.id, referralStatusGroup: 'closed' }
      })

      it('renders the show template with the correct response locals', async () => {
        const requestHandler = controller.show()
        courseService.getCourse.mockResolvedValue(limeCourse)
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/assess/show', {
          action: assessPaths.caseList.filter({ courseId: limeCourse.id, referralStatusGroup: 'closed' }),
          audienceSelectItems,
          pageHeading: 'Lime Course',
          pageTitleOverride: 'Manage closed programme team referrals: Lime Course',
          pagination,
          primaryNavigationItems,
          referralStatusGroup: 'closed',
          referralStatusSelectItems: {
            closed: referralStatusSelectItems,
            open: referralStatusSelectItems,
          },
          referralsFiltered: false,
          subNavigationItems,
          tableHeadings,
          tableRows,
        })
        expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(undefined)
        expect(referralService.getReferralViews).toHaveBeenCalledWith(username, activeCaseLoadId, {
          audience: undefined,
          courseName: 'Lime Course',
          hasLdcString: undefined,
          status: undefined,
          statusGroup: 'closed',
        })
        expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        )
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          queryParamsExcludingPage,
          closedPaginatedReferralViews.pageNumber,
          closedPaginatedReferralViews.totalPages,
        )
        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'closed' }),
          queryParamsExcludingSort,
        )
        expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(limeCourseAudiences, false, undefined)
        expect(CaseListUtils.primaryNavigationItems).toHaveBeenCalledWith(request.path, courses)
        expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
          pathWithQuery,
          {
            audience: 'Programme strand',
            earliestReleaseDate: 'Earliest release date',
            location: 'Location',
            sentenceType: 'Sentence type',
            status: 'Referral status',
            surname: 'Name and prison number',
          },
          undefined,
          undefined,
        )
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(closedReferralStatuses, undefined, true)
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(openReferralStatuses, undefined, true)
        expect(CaseListUtils.assessSubNavigationItems).toHaveBeenCalledWith(
          request.path,
          limeCourse.id,
          { closed: 1, open: 3 },
          queryParamsExcludingPage,
        )
        expect(CaseListUtils.tableRows).toHaveBeenCalledWith(closedPaginatedReferralViews.content, columnsToInclude)
      })
    })

    describe('when the referral status group is not valid', () => {
      it('throws a 404 error', async () => {
        request.params = { courseId: limeCourse.id, referralStatusGroup: 'invalid-group' }

        const requestHandler = controller.show()
        const expectedError = createError(404, 'Not found')

        await expect(() => requestHandler(request, response, next)).rejects.toThrow(expectedError)
        expect(referralService.getReferralViews).not.toHaveBeenCalled()
      })
    })

    describe('when the course is hsp', () => {
      const hspCourse = courseFactory.build({ name: 'Healthy Sex Programme' })
      beforeEach(() => {
        request.params = { courseId: hspCourse.id, referralStatusGroup }
        when(courseService.getCourse).calledWith(username, hspCourse.id).mockResolvedValue(hspCourse)
      })

      it('renders the show template with the correct response locals', async () => {
        expect(request.session.recentCaseListPath).toBeUndefined()

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.recentCaseListPath).toBe(originalUrl)
        expect(response.render).toHaveBeenCalledWith('referrals/caseList/assess/show', {
          action: assessPaths.caseList.filter({ courseId: hspCourse.id, referralStatusGroup }),
          audienceSelectItems: [
            {
              selected: false,
              text: 'All offences',
              value: 'all offences',
            },
            {
              selected: false,
              text: 'Extremism offence',
              value: 'extremism offence',
            },
            {
              selected: false,
              text: 'General offence',
              value: 'general offence',
            },
            { selected: false, text: 'Gang offence', value: 'gang offence' },
            {
              selected: false,
              text: 'General violence offence',
              value: 'general violence offence',
            },
            {
              selected: false,
              text: 'Intimate partner violence offence',
              value: 'intimate partner violence offence',
            },
            {
              selected: false,
              text: 'Sexual offence',
              value: 'sexual offence',
            },
          ],
          pageHeading: 'Healthy Sex Programme',
          pageTitleOverride: 'Manage open programme team referrals: Healthy Sex Programme',
          pagination,
          referralStatusGroup,
          referralStatusSelectItems: {
            closed: referralStatusSelectItems,
            open: referralStatusSelectItems,
          },
          referralsFiltered: false,
          subNavigationItems,
          tableHeadings,
          tableRows,
        })
        expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(undefined)
        expect(referralService.getReferralViews).toHaveBeenCalledWith(username, 'NAT', {
          audience: undefined,
          courseName: 'Healthy Sex Programme',
          hasLdcString: undefined,
          status: undefined,
          statusGroup: referralStatusGroup,
        })
        expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        )

        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          assessPaths.caseList.show({ courseId: hspCourse.id, referralStatusGroup }),
          queryParamsExcludingSort,
        )
        expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(limeCourseAudiences, true, undefined)
        expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
          pathWithQuery,
          {
            audience: 'Programme strand',
            earliestReleaseDate: 'Earliest release date',
            location: 'Location',
            sentenceType: 'Sentence type',
            status: 'Referral status',
            surname: 'Name and prison number',
          },
          undefined,
          undefined,
        )
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(closedReferralStatuses, undefined, true)
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(openReferralStatuses, undefined, true)
      })
    })
  })
})
