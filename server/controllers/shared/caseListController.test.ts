import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CaseListController from './caseListController'
import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { referralSummaryFactory } from '../../testutils/factories'
import { CaseListUtils, PaginationUtils, PathUtils } from '../../utils'
import type { Paginated, ReferralSummary } from '@accredited-programmes/models'
import type { GovukFrontendPaginationWithItems, QueryParam } from '@accredited-programmes/ui'
import type { GovukFrontendSelectItem, GovukFrontendTableRow } from '@govuk-frontend'

jest.mock('../../utils/paginationUtils')
jest.mock('../../utils/pathUtils')
jest.mock('../../utils/referrals/caseListUtils')

describe('CaseListController', () => {
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'
  const queryParamsExcludingPage: Array<QueryParam> = []

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})

  let controller: CaseListController

  beforeEach(() => {
    controller = new CaseListController(referralService)

    request = createMock<Request>({ user: { username } })
    response = createMock<Response>({ locals: { user: { activeCaseLoadId, username } } })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('filter', () => {
    const redirectPathBase = assessPaths.caseList.show({})
    const pathWithQuery = 'path-with-query'
    const audience = 'General violence offence'
    const status = 'ASSESSMENT_STARTED'

    beforeEach(() => {
      ;(PathUtils.pathWithQuery as jest.Mock).mockReturnValue(pathWithQuery)
      ;(CaseListUtils.queryParamsExcludingPage as jest.Mock).mockReturnValue(queryParamsExcludingPage)
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
    let paginatedReferralSummaries: Paginated<ReferralSummary>
    const audienceSelectItems = 'aaa' as unknown as jest.Mocked<Array<GovukFrontendSelectItem>>
    const statusSelectItems = 'bbb' as unknown as jest.Mocked<Array<GovukFrontendSelectItem>>
    const caseListTableRows = 'ccc' as unknown as jest.Mocked<Array<GovukFrontendTableRow>>
    const pagination = 'ddd' as unknown as jest.Mocked<GovukFrontendPaginationWithItems>

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
      ;(CaseListUtils.audienceSelectItems as jest.Mock).mockReturnValue(audienceSelectItems)
      ;(CaseListUtils.statusSelectItems as jest.Mock).mockReturnValue(statusSelectItems)
      ;(CaseListUtils.caseListTableRows as jest.Mock).mockReturnValue(caseListTableRows)
      ;(CaseListUtils.queryParamsExcludingPage as jest.Mock).mockReturnValue(queryParamsExcludingPage)
      ;(PaginationUtils.pagination as jest.Mock).mockReturnValue(pagination)
    })

    it('renders the show template with the correct response locals', async () => {
      request.path = assessPaths.caseList.show({})
      ;(CaseListUtils.uiToApiAudienceQueryParam as jest.Mock).mockReturnValue(undefined)
      ;(CaseListUtils.uiToApiStatusQueryParam as jest.Mock).mockReturnValue(undefined)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
        action: assessPaths.caseList.filter({}),
        audienceSelectItems,
        pageHeading: 'My referrals',
        pagination,
        referralStatusSelectItems: CaseListUtils.statusSelectItems(),
        tableRows: caseListTableRows,
      })
      expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(undefined)
      expect(CaseListUtils.uiToApiStatusQueryParam).toHaveBeenCalledWith(undefined)
      expect(referralService.getReferralSummaries).toHaveBeenCalledWith(username, activeCaseLoadId, {
        audience: undefined,
        status: undefined,
      })
      expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(undefined, undefined)
      expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
        request.path,
        queryParamsExcludingPage,
        paginatedReferralSummaries.pageNumber,
        paginatedReferralSummaries.totalPages,
      )
      expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(undefined)
      expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(undefined)
      expect(CaseListUtils.caseListTableRows).toHaveBeenCalledWith(paginatedReferralSummaries.content)
    })

    describe('when there are query parameters', () => {
      it('renders the show template with the correct response locals', async () => {
        const uiAudienceQueryParam = 'general offence'
        const uiStatusQueryParam = 'referral submitted'
        const apiAudienceQueryParam = 'General offence'
        const apiStatusQueryParam = 'REFERRAL_SUBMITTED'
        request.path = assessPaths.caseList.show({})
        request.query = {
          status: 'referral submitted',
          strand: 'general offence',
        }
        ;(CaseListUtils.uiToApiAudienceQueryParam as jest.Mock).mockReturnValue(apiAudienceQueryParam)
        ;(CaseListUtils.uiToApiStatusQueryParam as jest.Mock).mockReturnValue(apiStatusQueryParam)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
          action: assessPaths.caseList.filter({}),
          audienceSelectItems,
          pageHeading: 'My referrals',
          pagination,
          referralStatusSelectItems: CaseListUtils.statusSelectItems('referral submitted'),
          tableRows: CaseListUtils.caseListTableRows(paginatedReferralSummaries.content),
        })
        expect(CaseListUtils.uiToApiAudienceQueryParam).toHaveBeenCalledWith(uiAudienceQueryParam)
        expect(CaseListUtils.uiToApiStatusQueryParam).toHaveBeenCalledWith(uiStatusQueryParam)
        expect(referralService.getReferralSummaries).toHaveBeenCalledWith(username, activeCaseLoadId, {
          audience: apiAudienceQueryParam,
          status: apiStatusQueryParam,
        })
        expect(CaseListUtils.queryParamsExcludingPage).toHaveBeenLastCalledWith(
          uiAudienceQueryParam,
          uiStatusQueryParam,
        )
        expect(PaginationUtils.pagination).toHaveBeenLastCalledWith(
          request.path,
          queryParamsExcludingPage,
          paginatedReferralSummaries.pageNumber,
          paginatedReferralSummaries.totalPages,
        )
        expect(CaseListUtils.audienceSelectItems).toHaveBeenCalledWith(uiAudienceQueryParam)
        expect(CaseListUtils.statusSelectItems).toHaveBeenCalledWith(uiStatusQueryParam)
        expect(CaseListUtils.caseListTableRows).toHaveBeenCalledWith(paginatedReferralSummaries.content)
      })
    })
  })
})
