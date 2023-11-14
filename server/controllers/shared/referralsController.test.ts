import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SubmittedReferralsController from './referralsController'
import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  offenderSentenceAndOffencesFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, DateUtils, PersonUtils, ReferralUtils, SentenceInformationUtils } from '../../utils'
import type { GovukFrontendSummaryListWithRowsWithKeysAndValues } from '@accredited-programmes/ui'

describe('ReferralsController', () => {
  const userToken = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const person = personFactory.build()
  const referral = referralFactory
    .submitted()
    .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
  const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build()

  const sharedPageData = {
    courseOfferingSummaryListRows: ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name),
    pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
    person,
    referral,
    submissionSummaryListRows: ReferralUtils.submissionSummaryListRows(referral),
  }

  let controller: SubmittedReferralsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token: userToken } })
    response = Helpers.createMockResponseWithCaseloads()

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    organisationService.getOrganisation.mockResolvedValue(organisation)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    controller = new SubmittedReferralsController(courseService, organisationService, personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('additionalInformation', () => {
    it('renders the additional information template with the correct response locals', async () => {
      request.path = referPaths.show.additionalInformation({ referralId: referral.id })

      const requestHandler = controller.additionalInformation()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
        ...sharedPageData,
        additionalInformation: referral.additionalInformation,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
      })
    })
  })

  describe('personalDetails', () => {
    it('renders the personal details template with the correct response locals', async () => {
      request.path = referPaths.show.personalDetails({ referralId: referral.id })

      const requestHandler = controller.personalDetails()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/personalDetails', {
        ...sharedPageData,
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        personSummaryListRows: PersonUtils.summaryListRows(person),
      })
    })
  })

  describe('programmeHistory', () => {
    it('renders the programme history template with the correct response locals', async () => {
      const courseParticipationSummaryListsOptions = [createMock<GovukFrontendSummaryListWithRowsWithKeysAndValues>()]

      courseService.getAndPresentParticipationsByPerson.mockResolvedValue(courseParticipationSummaryListsOptions)

      request.path = referPaths.show.programmeHistory({ referralId: referral.id })

      const requestHandler = controller.programmeHistory()
      await requestHandler(request, response, next)

      expect(courseService.getAndPresentParticipationsByPerson).toHaveBeenCalledWith(
        request.user!.token,
        sharedPageData.person.prisonNumber,
        sharedPageData.referral.id,
        { change: false, remove: false },
      )

      expect(response.render).toHaveBeenCalledWith('referrals/show/programmeHistory', {
        ...sharedPageData,
        courseParticipationSummaryListsOptions,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
      })
    })
  })

  describe('sentenceInformation', () => {
    it('renders the sentence information template with the correct response locals', async () => {
      personService.getOffenderSentenceAndOffences.mockResolvedValue(offenderSentenceAndOffences)

      request.path = referPaths.show.sentenceInformation({ referralId: referral.id })

      const requestHandler = controller.sentenceInformation()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/sentenceInformation', {
        ...sharedPageData,
        detailsSummaryListRows: SentenceInformationUtils.detailsSummaryListRows(
          sharedPageData.person.sentenceStartDate,
          offenderSentenceAndOffences.sentenceTypeDescription,
        ),
        importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        releaseDatesSummaryListRows: PersonUtils.releaseDatesSummaryListRows(sharedPageData.person),
      })
    })
  })
})
