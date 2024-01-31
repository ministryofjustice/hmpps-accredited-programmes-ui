import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import ReferCaseListController from './caseListController'
import { referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { referralSummaryFactory } from '../../testutils/factories'
import { CaseListUtils, PaginationUtils } from '../../utils'
import type { PaginatedReferralSummary, ReferralSummary } from '@accredited-programmes/api'
import type {
  CaseListColumnHeader,
  GovukFrontendPaginationWithItems,
  MojFrontendNavigationItem,
} from '@accredited-programmes/ui'
import type { GovukFrontendTableRow } from '@govuk-frontend'

jest.mock('../../utils/paginationUtils')
jest.mock('../../utils/pathUtils')
jest.mock('../../utils/referrals/caseListUtils')

describe('ReferCaseListController', () => {
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})

  let controller: ReferCaseListController

  beforeEach(() => {
    controller = new ReferCaseListController(referralService)

    request = createMock<Request>({ user: { username } })
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
    let paginatedReferralSummaries: PaginatedReferralSummary & { content: Array<ReferralSummary> }
    const tableRows = 'aaa' as unknown as jest.Mocked<Array<GovukFrontendTableRow>>
    const pagination = 'bbb' as unknown as jest.Mocked<GovukFrontendPaginationWithItems>
    const subNavigationItems = 'ccc' as unknown as jest.Mocked<Array<MojFrontendNavigationItem>>

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
      referralService.getMyReferralSummaries.mockResolvedValue(paginatedReferralSummaries)
      ;(CaseListUtils.primaryNavigationItems as jest.Mock).mockReturnValue(subNavigationItems)
      ;(CaseListUtils.tableRows as jest.Mock).mockReturnValue(tableRows)
      ;(PaginationUtils.pagination as jest.Mock).mockReturnValue(pagination)
    })

    describe('when the referral status group is "open"', () => {
      it('renders the show template with the correct response locals', async () => {
        request.params = { referralStatusGroup: 'open' }

        const apiOpenStatusQuery = 'ASSESSMENT_STARTED,AWAITING_ASSESSMENT,REFERRAL_SUBMITTED'
        ;(CaseListUtils.uiToApiStatusQueryParam as jest.Mock).mockReturnValue(apiOpenStatusQuery)

        const columnsToInclude: Array<CaseListColumnHeader> = [
          'Name / Prison number',
          'Date referred',
          'Earliest release date',
          'Release date type',
          'Programme location',
          'Programme name',
          'Referral status',
        ]

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/refer/show', {
          finalColumnHeader: 'Referral status',
          isMyReferralsPage: true,
          pageHeading: 'My referrals',
          pagination,
          subNavigationItems: CaseListUtils.subNavigationItems(request.path),
          tableRows,
        })
        expect(CaseListUtils.uiToApiStatusQueryParam).toHaveBeenCalledWith(apiOpenStatusQuery.toLowerCase())
        expect(referralService.getMyReferralSummaries).toHaveBeenCalledWith(username, {
          status: apiOpenStatusQuery,
        })
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          [],
          paginatedReferralSummaries.pageNumber,
          paginatedReferralSummaries.totalPages,
        )
        expect(CaseListUtils.subNavigationItems).toHaveBeenCalledWith(request.path)
        expect(CaseListUtils.tableRows).toHaveBeenCalledWith(
          columnsToInclude,
          paginatedReferralSummaries.content,
          referPaths,
        )
        expect(referralService.getNumberOfTasksCompleted).not.toHaveBeenCalled()
      })
    })

    describe('when the referral status group is "draft"', () => {
      it('renders the show template with the correct response locals', async () => {
        request.params = { referralStatusGroup: 'draft' }

        const apiDraftStatusQuery = 'REFERRAL_STARTED'
        ;(CaseListUtils.uiToApiStatusQueryParam as jest.Mock).mockReturnValue(apiDraftStatusQuery)

        const columnsToInclude: Array<CaseListColumnHeader> = [
          'Name / Prison number',
          'Date referred',
          'Earliest release date',
          'Release date type',
          'Programme location',
          'Programme name',
          'Progress',
        ]

        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, paginatedReferralSummaries.content[0].id)
          .mockResolvedValue(1)
        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, paginatedReferralSummaries.content[1].id)
          .mockResolvedValue(2)
        when(referralService.getNumberOfTasksCompleted)
          .calledWith(username, paginatedReferralSummaries.content[2].id)
          .mockResolvedValue(3)

        const expectedPaginatedReferralSummariesContent = [
          { ...paginatedReferralSummaries.content[0], tasksCompleted: 1 },
          { ...paginatedReferralSummaries.content[1], tasksCompleted: 2 },
          { ...paginatedReferralSummaries.content[2], tasksCompleted: 3 },
        ]

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/refer/show', {
          finalColumnHeader: 'Progress',
          isMyReferralsPage: true,
          pageHeading: 'My referrals',
          pagination,
          subNavigationItems: CaseListUtils.subNavigationItems(request.path),
          tableRows,
        })
        expect(CaseListUtils.uiToApiStatusQueryParam).toHaveBeenCalledWith(apiDraftStatusQuery.toLowerCase())
        expect(referralService.getMyReferralSummaries).toHaveBeenCalledWith(username, {
          status: apiDraftStatusQuery,
        })
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          [],
          paginatedReferralSummaries.pageNumber,
          paginatedReferralSummaries.totalPages,
        )
        expect(CaseListUtils.subNavigationItems).toHaveBeenCalledWith(request.path)
        expect(CaseListUtils.tableRows).toHaveBeenCalledWith(
          columnsToInclude,
          expectedPaginatedReferralSummariesContent,
          referPaths,
        )
        expect(referralService.getNumberOfTasksCompleted).toHaveBeenCalledTimes(
          paginatedReferralSummaries.content.length,
        )
      })
    })

    describe('when the referral status group is not valid', () => {
      it('throws a 404 error', async () => {
        request.params = { referralStatusGroup: 'invalid-group' }

        const requestHandler = controller.show()
        const expectedError = createError(404, 'Not found')

        await expect(() => requestHandler(request, response, next)).rejects.toThrow(expectedError)
        expect(referralService.getMyReferralSummaries).not.toHaveBeenCalled()
      })
    })
  })
})
