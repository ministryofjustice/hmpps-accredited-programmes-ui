import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CaseListController from './caseListController'
import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { referralSummaryFactory } from '../../testutils/factories'
import { ReferralUtils } from '../../utils'
import type { Paginated, ReferralSummary } from '@accredited-programmes/models'

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

  describe('show', () => {
    it('renders the show template with the correct response locals', async () => {
      request.path = assessPaths.caseList.show({})

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
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
          audience: 'General offence',
          status: 'REFERRAL_SUBMITTED',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/caseList/show', {
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
