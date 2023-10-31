import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SubmittedReferralsController from './referralsController'
import { referPaths } from '../../paths'
import type {
  CourseService,
  OrganisationService,
  PersonService,
  ReferralService,
  SentenceInformationService,
} from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
  sentenceAndOffenceDetailsFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, DateUtils, PersonUtils, ReferralUtils, SentenceInformationUtils } from '../../utils'

describe('ReferralsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})
  const sentenceInformationService = createMock<SentenceInformationService>({})

  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const person = personFactory.build()
  const referral = referralFactory
    .submitted()
    .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
  const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()

  const sharedPageData = {
    courseOfferingSummaryListRows: ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name),
    pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
    person,
    referral,
    submissionSummaryListRows: ReferralUtils.submissionSummaryListRows(referral),
  }

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
      sentenceInformationService,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('personalDetails', () => {
    it('renders the personal details template with the correct response locals', async () => {
      request.path = referPaths.show.personalDetails({ referralId: referral.id })

      const requestHandler = submittedReferralsController.personalDetails()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/personalDetails', {
        ...sharedPageData,
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        personSummaryListRows: PersonUtils.summaryListRows(person),
      })
    })
  })

  describe('sentenceInformation', () => {
    it('renders the sentence information template with the correct response locals', async () => {
      sentenceInformationService.getSentenceAndOffenceDetails.mockResolvedValue(sentenceAndOffenceDetails)

      request.path = referPaths.show.sentenceInformation({ referralId: referral.id })

      const requestHandler = submittedReferralsController.sentenceInformation()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/sentenceInformation', {
        ...sharedPageData,
        detailsSummaryListRows: SentenceInformationUtils.detailsSummaryListRows(sentenceAndOffenceDetails),
        importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
      })
    })
  })
})
