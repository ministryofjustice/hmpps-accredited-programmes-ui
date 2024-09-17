import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import PniController from './pniController'
import type { CourseService, PersonService, PniService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  pniScoreFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, PniUtils, ShowReferralUtils } from '../../utils'
import type { Person, Referral } from '@accredited-programmes/models'

jest.mock('../../utils/referrals/showReferralUtils')
jest.mock('../../utils/risksAndNeeds/pniUtils')

const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>
const mockPniUtils = PniUtils as jest.Mocked<typeof PniUtils>

describe('PniController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const pniService = createMock<PniService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const usersActiveCaseLoadId = 'MDI'
  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  const buttons = [{ href: 'button-href', text: 'Button' }]
  const recentCaseListPath = '/case-list-path'
  const relationshipsSummaryListRows = [{ key: { text: 'Relationship key' }, value: { text: 'Value' } }]
  const selfManagementSummaryListRows = [{ key: { text: 'Self management key' }, value: { text: 'Value' } }]
  const sexSummaryListRows = [{ key: { text: 'Sex key' }, value: { text: 'Value' } }]
  const thinkingSummaryListRows = [{ key: { text: 'Thinking key' }, value: { text: 'Value' } }]
  let person: Person
  let referral: Referral

  let controller: PniController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)
    mockShowReferralUtils.buttons.mockReturnValue(buttons)
    mockPniUtils.relationshipsSummaryListRows.mockReturnValue(relationshipsSummaryListRows)
    mockPniUtils.selfManagementSummaryListRows.mockReturnValue(selfManagementSummaryListRows)
    mockPniUtils.sexSummaryListRows.mockReturnValue(sexSummaryListRows)
    mockPniUtils.thinkingSummaryListRows.mockReturnValue(thinkingSummaryListRows)

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    controller = new PniController(courseService, pniService, personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      session: { recentCaseListPath },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
    response.locals.user.activeCaseLoadId = usersActiveCaseLoadId
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders the show pni page with the correct response locals', async () => {
    pniService.getPni.mockResolvedValue(pniScoreFactory.build())

    const requestHandler = controller.show()
    await requestHandler(request, response, next)

    expect(response.render).toHaveBeenCalledWith('referrals/show/pni/show', {
      buttons,
      hasData: true,
      pageHeading: `Referral to ${coursePresenter.displayName}`,
      pageSubHeading: 'Programme needs identifier',
      person,
      referral,
      relationshipsSummaryListRows,
      selfManagementSummaryListRows,
      sexSummaryListRows,
      subNavigationItems,
      thinkingSummaryListRows,
    })

    expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(
      request.path,
      'pni',
      referral.id,
      usersActiveCaseLoadId,
    )
  })

  describe('when the pni service returns `null`', () => {
    it('renders the show pni page with the correct response locals', async () => {
      pniService.getPni.mockResolvedValue(null)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/pni/show', {
        buttons,
        hasData: false,
        pageHeading: `Referral to ${coursePresenter.displayName}`,
        pageSubHeading: 'Programme needs identifier',
        person,
        referral,
        subNavigationItems,
      })
    })
  })
})
