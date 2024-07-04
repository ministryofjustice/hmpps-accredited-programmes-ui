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
import type {
  CaseListColumnHeader,
  GovukFrontendPaginationWithItems,
  MojFrontendNavigationItem,
  QueryParam,
} from '@accredited-programmes/ui'
import type { GovukFrontendTableRow } from '@govuk-frontend'

jest.mock('../../utils/paginationUtils')
jest.mock('../../utils/pathUtils')
jest.mock('../../utils/referrals/caseListUtils')

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

  describe('indexRedirect', () => {
    it('redirects to the show action with the open referral state', async () => {
      const requestHandler = controller.indexRedirect()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.caseList.show({ referralStatusGroup: 'open' }))
    })
  })

  describe('show', () => {
    let paginatedReferralViews: Paginated<ReferralView>
    const tableRows = 'aaa' as unknown as jest.Mocked<Array<GovukFrontendTableRow>>
    const pagination = 'bbb' as unknown as jest.Mocked<GovukFrontendPaginationWithItems>
    const subNavigationItems = 'ccc' as unknown as jest.Mocked<Array<MojFrontendNavigationItem>>
    const tableHeadings = [{ text: 'Heading 1' }, { text: 'Heading 2' }] as unknown as jest.Mocked<
      Array<CaseListColumnHeader>
    >

    beforeEach(() => {
      const referralViews = referralViewFactory.buildList(3)
      paginatedReferralViews = {
        content: referralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 10,
        totalElements: referralViews.length,
        totalPages: 1,
      }
      referralService.getMyReferralViews.mockResolvedValue(paginatedReferralViews)
      ;(CaseListUtils.primaryNavigationItems as jest.Mock).mockReturnValue(subNavigationItems)
      ;(CaseListUtils.queryParamsExcludingPage as jest.Mock).mockReturnValue(queryParamsExcludingPage)
      ;(CaseListUtils.queryParamsExcludingSort as jest.Mock).mockReturnValue(queryParamsExcludingSort)
      ;(CaseListUtils.sortableTableHeadings as jest.Mock).mockReturnValue(tableHeadings)
      ;(CaseListUtils.tableRows as jest.Mock).mockReturnValue(tableRows)
      ;(PaginationUtils.pagination as jest.Mock).mockReturnValue(pagination)
      ;(PathUtils.pathWithQuery as jest.Mock).mockReturnValue(pathWithQuery)
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
          isMyReferralsPage: true,
          pageHeading: 'My referrals',
          pagination,
          referralStatusGroup: 'open',
          subNavigationItems: CaseListUtils.referSubNavigationItems(request.path),
          tableHeadings,
          tableRows,
        })
        expect(referralService.getMyReferralViews).toHaveBeenCalledWith(username, {
          statusGroup: 'open',
        })
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          [],
          paginatedReferralViews.pageNumber,
          paginatedReferralViews.totalPages,
        )
        expect(CaseListUtils.referSubNavigationItems).toHaveBeenCalledWith(request.path)
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
          paginatedReferralViews.content,
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
          const uiNameOrIdParam = 'ABC1234'
          const uiSortColumnQueryParam = 'surname'
          const uiSortDirectionQueryParam = 'ascending'

          request.query = {
            nameOrId: uiNameOrIdParam,
            sortColumn: uiSortColumnQueryParam,
            sortDirection: uiSortDirectionQueryParam,
          }

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('referrals/caseList/refer/show', {
            isMyReferralsPage: true,
            pageHeading: 'My referrals',
            pagination,
            referralStatusGroup: 'open',
            subNavigationItems: CaseListUtils.referSubNavigationItems(request.path),
            tableHeadings,
            tableRows,
          })
          expect(referralService.getMyReferralViews).toHaveBeenCalledWith(username, {
            nameOrId: uiNameOrIdParam,
            sortColumn: uiSortColumnQueryParam,
            sortDirection: uiSortDirectionQueryParam,
            statusGroup: 'open',
          })
          expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
            undefined,
            uiNameOrIdParam,
            undefined,
            uiSortColumnQueryParam,
            uiSortDirectionQueryParam,
          )
          expect(CaseListUtils.queryParamsExcludingSort).toHaveBeenLastCalledWith(
            undefined,
            uiNameOrIdParam,
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
            paginatedReferralViews.content,
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
          .calledWith(username, paginatedReferralViews.content[0].id)
          .mockResolvedValue(1)
        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, paginatedReferralViews.content[1].id)
          .mockResolvedValue(2)
        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, paginatedReferralViews.content[2].id)
          .mockResolvedValue(3)

        const expectedPaginatedReferralViewsContent = [
          { ...paginatedReferralViews.content[0], tasksCompleted: 1 },
          { ...paginatedReferralViews.content[1], tasksCompleted: 2 },
          { ...paginatedReferralViews.content[2], tasksCompleted: 3 },
        ]

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/refer/show', {
          draftReferralDeletedMessage,
          isMyReferralsPage: true,
          pageHeading: 'My referrals',
          pagination,
          referralStatusGroup: 'draft',
          subNavigationItems: CaseListUtils.referSubNavigationItems(request.path),
          tableHeadings: [...tableHeadings, { text: 'Progress' }],
          tableRows,
        })
        expect(referralService.getMyReferralViews).toHaveBeenCalledWith(username, {
          statusGroup: 'draft',
        })
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          queryParamsExcludingPage,
          paginatedReferralViews.pageNumber,
          paginatedReferralViews.totalPages,
        )
        expect(PathUtils.pathWithQuery).toHaveBeenCalledWith(
          referPaths.caseList.show({ referralStatusGroup: 'draft' }),
          queryParamsExcludingSort,
        )
        expect(CaseListUtils.referSubNavigationItems).toHaveBeenCalledWith(request.path)
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
        expect(referralService.getNumberOfTasksCompleted).toHaveBeenCalledTimes(paginatedReferralViews.content.length)
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
