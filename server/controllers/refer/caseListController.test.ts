import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import ReferCaseListController from './caseListController'
import { referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { referralViewFactory } from '../../testutils/factories'
import { CaseListUtils, PaginationUtils, PathUtils } from '../../utils'
import type { Paginated, ReferralView } from '@accredited-programmes/models'
import type { GovukFrontendPaginationWithItems, MojFrontendNavigationItem, QueryParam } from '@accredited-programmes/ui'
import type { GovukFrontendTableRow } from '@govuk-frontend'

jest.mock('../../utils/paginationUtils')
jest.mock('../../utils/pathUtils')
jest.mock('../../utils/referrals/caseListUtils')

const mockCaseListUtils = CaseListUtils as jest.Mocked<typeof CaseListUtils>
const mockPathUtils = PathUtils as jest.Mocked<typeof PathUtils>

describe('ReferCaseListController', () => {
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'
  const originalUrl = '/original-url'
  const pathWithQuery = 'path-with-query'
  const queryParamsExcludingPage: Array<QueryParam> = []
  const queryParamsExcludingSort: Array<QueryParam> = []

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})

  let controller: ReferCaseListController

  beforeEach(() => {
    controller = new ReferCaseListController(referralService)

    request = createMock<Request>({ flash: jest.fn().mockReturnValue([]), originalUrl, user: { username } })
    response = createMock<Response>({ locals: { user: { activeCaseLoadId, username } } })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('filter', () => {
    beforeEach(() => {
      mockPathUtils.pathWithQuery.mockReturnValue(pathWithQuery)
      mockCaseListUtils.queryParamsExcludingPage.mockReturnValue(queryParamsExcludingPage)

      request.params = { referralStatusGroup: 'open' }
    })

    it('redirects to the show action with the selected referral status group', async () => {
      const requestHandler = controller.filter()
      await requestHandler(request, response, next)

      expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
        referPaths.caseList.show({ referralStatusGroup: 'open' }),
        [],
      )
      expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      )
      expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
    })

    describe('when there is `nameOrId` in the request body', () => {
      it('redirects to the show action with the selected referral status group and `nameOrId`', async () => {
        const nameOrId = 'ABC1234'
        request.body = { nameOrId }

        const requestHandler = controller.filter()
        await requestHandler(request, response, next)

        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          referPaths.caseList.show({ referralStatusGroup: 'open' }),
          [],
        )
        expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenCalledWith(
          undefined,
          undefined,
          undefined,
          undefined,
          nameOrId,
        )
        expect(response.redirect).toHaveBeenCalledWith(pathWithQuery)
      })
    })
  })

  describe('indexRedirect', () => {
    it('redirects to the show action with the open referral state', async () => {
      const requestHandler = controller.indexRedirect()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.caseList.show({ referralStatusGroup: 'open' }))
    })
  })

  describe('show', () => {
    let openPaginatedReferralViews: Paginated<ReferralView>
    let closedPaginatedReferralViews: Paginated<ReferralView>
    let draftPaginatedReferralViews: Paginated<ReferralView>
    const tableRows = 'aaa' as unknown as jest.Mocked<Array<GovukFrontendTableRow>>
    const pagination = 'bbb' as unknown as jest.Mocked<GovukFrontendPaginationWithItems>
    const subNavigationItems = 'ccc' as unknown as jest.Mocked<Array<MojFrontendNavigationItem>>
    const tableHeadings = [{ text: 'Heading 1' }, { text: 'Heading 2' }]

    beforeEach(() => {
      const openReferralViews = referralViewFactory.buildList(4)
      const closedReferralViews = referralViewFactory.buildList(2)
      const draftReferralViews = referralViewFactory.buildList(3)

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

      draftPaginatedReferralViews = {
        ...openPaginatedReferralViews,
        content: draftReferralViews,
        totalElements: draftReferralViews.length,
      }

      when(referralService.getMyReferralViews)
        .calledWith(username, expect.objectContaining({ statusGroup: 'open' }))
        .mockResolvedValue(openPaginatedReferralViews)
      when(referralService.getMyReferralViews)
        .calledWith(username, expect.objectContaining({ statusGroup: 'closed' }))
        .mockResolvedValue(closedPaginatedReferralViews)
      when(referralService.getMyReferralViews)
        .calledWith(username, expect.objectContaining({ statusGroup: 'draft' }))
        .mockResolvedValue(draftPaginatedReferralViews)
      mockCaseListUtils.primaryNavigationItems.mockReturnValue(subNavigationItems)
      mockCaseListUtils.queryParamsExcludingPage.mockReturnValue(queryParamsExcludingPage)
      mockCaseListUtils.queryParamsExcludingSort.mockReturnValue(queryParamsExcludingSort)
      mockCaseListUtils.referSubNavigationItems.mockReturnValue(subNavigationItems)
      mockCaseListUtils.sortableTableHeadings.mockReturnValue(tableHeadings)
      mockCaseListUtils.tableRows.mockReturnValue(tableRows)
      ;(PaginationUtils.pagination as jest.Mock).mockReturnValue(pagination)
      mockPathUtils.pathWithQuery.mockReturnValue(pathWithQuery)
    })

    describe('when the referral status group is "open"', () => {
      beforeEach(() => {
        request.params = { referralStatusGroup: 'open' }
      })

      it('renders the show template with the correct response locals', async () => {
        expect(request.session.recentCaseListPath).toBeUndefined()

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.recentCaseListPath).toBe(originalUrl)
        expect(response.render).toHaveBeenCalledWith('referrals/caseList/refer/show', {
          action: '/refer/referrals/case-list/open',
          isMyReferralsPage: true,
          otherStatusGroups: ['draft', 'closed'],
          pageHeading: 'My referrals',
          pageTitleOverride: 'My open referrals',
          pagination,
          referralStatusGroup: 'open',
          subNavigationItems,
          tableHeadings,
          tableRows,
        })
        expect(referralService.getMyReferralViews).toHaveBeenCalledWith(username, {
          statusGroup: 'open',
        })
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          [],
          openPaginatedReferralViews.pageNumber,
          openPaginatedReferralViews.totalPages,
        )
        expect(CaseListUtils.referSubNavigationItems).toHaveBeenCalledWith(
          request.path,
          { closed: 2, draft: 3, open: 4 },
          [],
        )
        expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
          pathWithQuery,
          {
            earliestReleaseDate: 'Earliest release date',
            listDisplayName: 'Programme name',
            organisationName: 'Programme location',
            status: 'Referral status',
            submittedOn: 'Date referred',
            surname: 'Name and prison number',
          },
          undefined,
          undefined,
        )
        expect(CaseListUtils.tableRows).toHaveBeenCalledWith(
          openPaginatedReferralViews.content,
          [
            'Name and prison number',
            'Date referred',
            'Earliest release date',
            'Programme location',
            'Programme name',
            'Referral status',
          ],
          referPaths,
        )
        expect(referralService.getNumberOfTasksCompleted).not.toHaveBeenCalled()
      })

      describe('when there are query parameters', () => {
        it('renders the show template with the correct response locals', async () => {
          const uiNameOrIdQueryParam = 'hatton'
          const uiSortColumnQueryParam = 'surname'
          const uiSortDirectionQueryParam = 'ascending'

          request.query = {
            nameOrId: uiNameOrIdQueryParam,
            sortColumn: uiSortColumnQueryParam,
            sortDirection: uiSortDirectionQueryParam,
          }

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('referrals/caseList/refer/show', {
            action: '/refer/referrals/case-list/open',
            isMyReferralsPage: true,
            nameOrId: uiNameOrIdQueryParam,
            otherStatusGroups: ['draft', 'closed'],
            pageHeading: 'My referrals',
            pageTitleOverride: 'My open referrals',
            pagination,
            referralStatusGroup: 'open',
            subNavigationItems,
            tableHeadings,
            tableRows,
          })
          expect(referralService.getMyReferralViews).toHaveBeenCalledWith(username, {
            nameOrId: uiNameOrIdQueryParam,
            sortColumn: uiSortColumnQueryParam,
            sortDirection: uiSortDirectionQueryParam,
            statusGroup: 'open',
          })
          expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
            undefined,
            undefined,
            uiSortColumnQueryParam,
            uiSortDirectionQueryParam,
            uiNameOrIdQueryParam,
          )
          expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
            request.path,
            queryParamsExcludingPage,
            openPaginatedReferralViews.pageNumber,
            openPaginatedReferralViews.totalPages,
          )
          expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
            referPaths.caseList.show({ referralStatusGroup: 'open' }),
            queryParamsExcludingSort,
          )
          expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
            pathWithQuery,
            {
              earliestReleaseDate: 'Earliest release date',
              listDisplayName: 'Programme name',
              organisationName: 'Programme location',
              status: 'Referral status',
              submittedOn: 'Date referred',
              surname: 'Name and prison number',
            },
            uiSortColumnQueryParam,
            uiSortDirectionQueryParam,
          )
          expect(CaseListUtils.tableRows).toHaveBeenCalledWith(
            openPaginatedReferralViews.content,
            [
              'Name and prison number',
              'Date referred',
              'Earliest release date',
              'Programme location',
              'Programme name',
              'Referral status',
            ],
            referPaths,
          )
        })
      })
    })

    describe('when the referral status group is "draft"', () => {
      it('renders the show template with the correct response locals', async () => {
        const draftReferralDeletedMessage = 'Draft referral deleted message'

        request.flash = jest.fn().mockReturnValue([draftReferralDeletedMessage])
        request.params = { referralStatusGroup: 'draft' }

        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, draftPaginatedReferralViews.content[0].id)
          .mockResolvedValue(1)
        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, draftPaginatedReferralViews.content[1].id)
          .mockResolvedValue(2)
        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, draftPaginatedReferralViews.content[2].id)
          .mockResolvedValue(3)

        const expectedPaginatedReferralViewsContent = [
          { ...draftPaginatedReferralViews.content[0], tasksCompleted: 1 },
          { ...draftPaginatedReferralViews.content[1], tasksCompleted: 2 },
          { ...draftPaginatedReferralViews.content[2], tasksCompleted: 3 },
        ]

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/refer/show', {
          action: '/refer/referrals/case-list/draft',
          draftReferralDeletedMessage,
          isMyReferralsPage: true,
          otherStatusGroups: ['open', 'closed'],
          pageHeading: 'My referrals',
          pageTitleOverride: 'My draft referrals',
          pagination,
          referralStatusGroup: 'draft',
          subNavigationItems,
          tableHeadings: [...tableHeadings, { text: 'Progress' }],
          tableRows,
        })
        expect(referralService.getMyReferralViews).toHaveBeenCalledWith(username, {
          statusGroup: 'draft',
        })
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          queryParamsExcludingPage,
          draftPaginatedReferralViews.pageNumber,
          draftPaginatedReferralViews.totalPages,
        )
        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          referPaths.caseList.show({ referralStatusGroup: 'draft' }),
          queryParamsExcludingSort,
        )
        expect(CaseListUtils.referSubNavigationItems).toHaveBeenCalledWith(
          request.path,
          { closed: 2, draft: 3, open: 4 },
          [],
        )
        expect(CaseListUtils.sortableTableHeadings).toHaveBeenCalledWith(
          pathWithQuery,
          {
            earliestReleaseDate: 'Earliest release date',
            listDisplayName: 'Programme name',
            organisationName: 'Programme location',
            submittedOn: 'Date referred',
            surname: 'Name and prison number',
          },
          undefined,
          undefined,
        )
        expect(CaseListUtils.tableRows).toHaveBeenCalledWith(
          expectedPaginatedReferralViewsContent,
          [
            'Name and prison number',
            'Date referred',
            'Earliest release date',
            'Programme location',
            'Programme name',
            'Progress',
          ],
          referPaths,
        )
        expect(referralService.getNumberOfTasksCompleted).toHaveBeenCalledTimes(
          draftPaginatedReferralViews.content.length,
        )
      })
    })

    describe('when the referral status group is "closed"', () => {
      it('make the correct calls', async () => {
        request.params = { referralStatusGroup: 'closed' }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getMyReferralViews).toHaveBeenCalledWith(username, {
          statusGroup: 'closed',
        })
        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          referPaths.caseList.show({ referralStatusGroup: 'closed' }),
          queryParamsExcludingSort,
        )
      })
    })

    describe('when the referral status group is not valid', () => {
      it('throws a 404 error', async () => {
        request.params = { referralStatusGroup: 'invalid-group' }

        const requestHandler = controller.show()
        const expectedError = createError(404, 'Not found')

        await expect(() => requestHandler(request, response, next)).rejects.toThrow(expectedError)
        expect(referralService.getMyReferralViews).not.toHaveBeenCalled()
      })
    })
  })
})
