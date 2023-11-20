import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CaseListController from './caseListController'
import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { caseloadFactory, referralSummaryFactory } from '../../testutils/factories'
import { ReferralUtils } from '../../utils'
import type { Paginated, ReferralSummary } from '@accredited-programmes/models'
import type { Caseload } from '@prison-api'

describe('CaseListController', () => {
  let caseloads: Array<Caseload>
  const username = 'USERNAME'
  const activeCaseLoadId = 'MDI'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const referralService = createMock<ReferralService>({})
  let paginatedReferralSummaries: Paginated<ReferralSummary>

  let controller: CaseListController

  beforeEach(() => {
    caseloads = [
      caseloadFactory.build({ caseLoadId: activeCaseLoadId, currentlyActive: true }),
      caseloadFactory.build({ currentlyActive: false }),
    ]

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
    response = createMock<Response>({ locals: { user: { caseloads, username } } })
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
        pageHeading: 'My referrals',
        tableRows: ReferralUtils.caseListTableRows(paginatedReferralSummaries.content),
      })

      expect(referralService.getReferralSummaries).toHaveBeenCalledWith(username, activeCaseLoadId)
    })
  })
})
