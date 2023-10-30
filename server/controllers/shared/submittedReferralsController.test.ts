import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SubmittedReferralsController from './submittedReferralsController'
import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, DateUtils, PersonUtils, ReferralUtils } from '../../utils'

describe('SubmittedReferralsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const course = courseFactory.build()
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const person = personFactory.build()
  const referral = referralFactory
    .submitted()
    .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

  let submittedReferralsController: SubmittedReferralsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    organisationService.getOrganisation.mockResolvedValue(organisation)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    submittedReferralsController = new SubmittedReferralsController(
      courseService,
      organisationService,
      personService,
      referralService,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('personalDetails', () => {
    it('renders the personal details template with the correct response locals', async () => {
      request.path = referPaths.submitted.personalDetails({ referralId: referral.id })

      const requestHandler = submittedReferralsController.personalDetails()
      await requestHandler(request, response, next)

      const coursePresenter = CourseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('referrals/submitted/personalDetails', {
        courseOfferingSummaryListRows: ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name),
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referral,
      })
    })
  })
})
