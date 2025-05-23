import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import PniController from './pniController'
import { assessPaths } from '../../paths'
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
import type { Person } from '@accredited-programmes/models'
import type { Referral } from '@accredited-programmes-api'

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

  const course = courseFactory.build({ intensity: 'HIGH_MODERATE' })
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
  const pathwayContent = {
    bodyText: 'Pathway content',
    class: 'pathway-content',
    dataTestId: 'pathway-content',
    headingText: 'High intensity',
  }
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
    mockPniUtils.pathwayContent.mockReturnValue(pathwayContent)

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    personService.getPerson.mockResolvedValue(person)
    pniService.getPni.mockResolvedValue(pniScoreFactory.build({ programmePathway: 'HIGH_INTENSITY_BC' }))
    referralService.getReferral.mockResolvedValue(referral)

    controller = new PniController(courseService, pniService, personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      session: { recentCaseListPath },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders the show pni page with the correct response locals', async () => {
    pniService.getPni.mockResolvedValue(pniScoreFactory.build({ programmePathway: 'HIGH_INTENSITY_BC' }))

    const requestHandler = controller.show()
    await requestHandler(request, response, next)

    expect(response.render).toHaveBeenCalledWith('referrals/show/pni/show', {
      buttons,
      hasData: true,
      missingInformation: false,
      pageHeading: `Referral to ${coursePresenter.displayName}`,
      pageSubHeading: 'Programme needs identifier',
      pageTitleOverride: `Programme needs identifier for referral to ${coursePresenter.displayName}`,
      pathwayContent,
      person,
      referral,
      relationshipsSummaryListRows,
      riskScoresHref: assessPaths.show.risksAndNeeds.risksAndAlerts({ referralId: referral.id }),
      selfManagementSummaryListRows,
      sexSummaryListRows,
      showOverrideText: false,
      subNavigationItems,
      thinkingSummaryListRows,
    })

    expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(request.path, 'pni', referral.id)
    expect(pniService.getPni).toHaveBeenCalledWith(username, referral.prisonNumber, {
      gender: person.gender,
      savePNI: true,
    })
  })

  describe('when the pni service returns `MISSING_INFORMATION`', () => {
    beforeEach(() => {
      pniService.getPni.mockResolvedValue(pniScoreFactory.build({ programmePathway: 'MISSING_INFORMATION' }))
    })

    it('renders the show pni page with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'referrals/show/pni/show',
        expect.objectContaining({
          hasData: true,
          missingInformation: true,
          showOverrideText: true,
        }),
      )
    })

    describe('when the referral is On programme or beyond', () => {
      it.each(['on_programme', 'programme_complete'])(
        'should set `showOverrideText` to `false` for the status: %s',
        async status => {
          referral.status = status

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(
            'referrals/show/pni/show',
            expect.objectContaining({
              showOverrideText: false,
            }),
          )
        },
      )
    })
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
        pageTitleOverride: `Programme needs identifier for referral to ${coursePresenter.displayName}`,
        pathwayContent,
        person,
        referral,
        riskScoresHref: assessPaths.show.risksAndNeeds.risksAndAlerts({ referralId: referral.id }),
        showOverrideText: true,
        subNavigationItems,
      })
    })
  })

  describe('when the pni service throws an error', () => {
    it('render the pni page with the correct response locals', async () => {
      pniService.getPni.mockRejectedValue(new Error('Some error'))

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(PniUtils.pathwayContent).toHaveBeenCalledWith(person.name, undefined)
      expect(response.render).toHaveBeenCalledWith(
        'referrals/show/pni/show',
        expect.objectContaining({
          hasData: false,
          pathwayContent,
        }),
      )
    })
  })
})
