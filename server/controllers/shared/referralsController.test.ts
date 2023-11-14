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
import type { Person, Referral } from '@accredited-programmes/models'
import type {
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
  ReferralSharedPageData,
} from '@accredited-programmes/ui'

jest.mock('../../utils/sentenceInformationUtils')

describe('ReferralsController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

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
  let person: Person
  let referral: Referral
  let sharedPageData: Omit<ReferralSharedPageData, 'navigationItems'>

  let controller: SubmittedReferralsController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    sharedPageData = {
      courseOfferingSummaryListRows: ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name),
      pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
      person,
      referral,
      submissionSummaryListRows: ReferralUtils.submissionSummaryListRows(referral),
    }

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    organisationService.getOrganisation.mockResolvedValue(organisation)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    controller = new SubmittedReferralsController(courseService, organisationService, personService, referralService)

    request = createMock<Request>({ params: { referralId: referral.id }, user: { token: userToken, username } })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('additionalInformation', () => {
    it('renders the additional information template with the correct response locals', async () => {
      request.path = referPaths.show.additionalInformation({ referralId: referral.id })

      const requestHandler = controller.additionalInformation()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

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

      assertSharedDataServicesAreCalledWithExpectedArguments()

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

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(courseService.getAndPresentParticipationsByPerson).toHaveBeenCalledWith(
        username,
        userToken,
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
    const detailsSummaryListRows = [createMock<GovukFrontendSummaryListRowWithKeyAndValue>()]

    describe('when all sentence information is present', () => {
      it('renders the sentence information template with the correct response locals', async () => {
        person.sentenceStartDate = '2023-01-02'
        const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build({
          sentenceTypeDescription: 'a description',
        })
        personService.getOffenderSentenceAndOffences.mockResolvedValue(offenderSentenceAndOffences)
        ;(SentenceInformationUtils.detailsSummaryListRows as jest.Mock).mockReturnValue(detailsSummaryListRows)

        request.path = referPaths.show.sentenceInformation({ referralId: referral.id })

        const requestHandler = controller.sentenceInformation()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(SentenceInformationUtils.detailsSummaryListRows).toHaveBeenCalledWith(
          sharedPageData.person.sentenceStartDate,
          offenderSentenceAndOffences.sentenceTypeDescription,
        )
        expect(response.render).toHaveBeenCalledWith('referrals/show/sentenceInformation', {
          ...sharedPageData,
          detailsSummaryListRows,
          hasSentenceDetails: true,
          importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
          releaseDatesSummaryListRows: PersonUtils.releaseDatesSummaryListRows(sharedPageData.person),
        })
      })
    })

    describe('when there are some but not all sentence details', () => {
      it('renders the sentence information template with the present sentence details', async () => {
        person.sentenceStartDate = '2023-01-02'
        const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build({
          sentenceTypeDescription: undefined,
        })
        personService.getOffenderSentenceAndOffences.mockResolvedValue(offenderSentenceAndOffences)
        ;(SentenceInformationUtils.detailsSummaryListRows as jest.Mock).mockReturnValue(detailsSummaryListRows)

        request.path = referPaths.show.sentenceInformation({ referralId: referral.id })

        const requestHandler = controller.sentenceInformation()
        await requestHandler(request, response, next)

        expect(SentenceInformationUtils.detailsSummaryListRows).toHaveBeenCalledWith(
          sharedPageData.person.sentenceStartDate,
          offenderSentenceAndOffences.sentenceTypeDescription,
        )
        expect(response.render).toHaveBeenCalledWith('referrals/show/sentenceInformation', {
          ...sharedPageData,
          detailsSummaryListRows,
          hasSentenceDetails: true,
          importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
          releaseDatesSummaryListRows: PersonUtils.releaseDatesSummaryListRows(sharedPageData.person),
        })
      })
    })

    describe('when there are no sentence details', () => {
      it('renders the sentence information template with no sentence details', async () => {
        person.sentenceStartDate = undefined
        const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build({
          sentenceTypeDescription: undefined,
        })
        personService.getOffenderSentenceAndOffences.mockResolvedValue(offenderSentenceAndOffences)

        request.path = referPaths.show.sentenceInformation({ referralId: referral.id })

        const requestHandler = controller.sentenceInformation()
        await requestHandler(request, response, next)

        expect(SentenceInformationUtils.detailsSummaryListRows).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalledWith('referrals/show/sentenceInformation', {
          ...sharedPageData,
          detailsSummaryListRows: [],
          hasSentenceDetails: false,
          importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
          releaseDatesSummaryListRows: PersonUtils.releaseDatesSummaryListRows(sharedPageData.person),
        })
      })
    })
  })

  function assertSharedDataServicesAreCalledWithExpectedArguments() {
    expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
    expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(courseService.getOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(personService.getPerson).toHaveBeenCalledWith(username, person.prisonNumber, response.locals.user.caseloads)
    expect(organisationService.getOrganisation).toHaveBeenCalledWith(userToken, organisation.id)
  }
})
