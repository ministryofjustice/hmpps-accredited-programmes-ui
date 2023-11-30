import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CaseListController from './caseListController'
import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { referralSummaryFactory } from '../../testutils/factories'
import { PathUtils, ReferralUtils } from '../../utils'
import type { Paginated, ReferralSummary } from '@accredited-programmes/models'

jest.mock('../../utils/pathUtils')

describe('CaseListController', () => {
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})
  let paginatedReferralSummaries: Paginated<ReferralSummary>

  let controller: CaseListController

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
    it('renders the show template with the correct response locals', async () => {
      request.path = assessPaths.caseList.show({})

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
        action: assessPaths.caseList.filter({}),
        audienceSelectItems: ReferralUtils.audienceSelectItems(),
        pageHeading: 'My referrals',
        referralStatusSelectItems: ReferralUtils.statusSelectItems(),
        tableRows: ReferralUtils.caseListTableRows(paginatedReferralSummaries.content),
      })

      expect(referralService.getReferralSummaries).toHaveBeenCalledWith(username, activeCaseLoadId, {
        audience: undefined,
        status: undefined,
      })
    })

    describe('when there are query parameters', () => {
      it('renders the show template with the correct response locals', async () => {
        request.path = assessPaths.caseList.show({})
        request.query = {
          status: 'REFERRAL_SUBMITTED',
          strand: 'General offence',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
          action: assessPaths.caseList.filter({}),
          audienceSelectItems: ReferralUtils.audienceSelectItems('General offence'),
          pageHeading: 'My referrals',
          referralStatusSelectItems: ReferralUtils.statusSelectItems('REFERRAL_SUBMITTED'),
          tableRows: ReferralUtils.caseListTableRows(paginatedReferralSummaries.content),
        })

        expect(referralService.getReferralSummaries).toHaveBeenCalledWith(username, activeCaseLoadId, {
          audience: 'General offence',
          status: 'REFERRAL_SUBMITTED',
        })
      })
    })
  })
})
