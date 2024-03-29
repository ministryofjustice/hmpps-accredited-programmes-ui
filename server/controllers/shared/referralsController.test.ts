import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import SubmittedReferralsController from './referralsController'
import { assessPaths, referPathBase, referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  offenceDetailsFactory,
  offenderSentenceAndOffencesFactory,
  organisationFactory,
  personFactory,
  referralFactory,
  referralStatusRefDataFactory,
  userFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import {
  CourseUtils,
  DateUtils,
  OffenceUtils,
  PersonUtils,
  SentenceInformationUtils,
  ShowReferralUtils,
} from '../../utils'
import { releaseDateFields } from '../../utils/personUtils'
import type { Person, Referral, ReferralStatusRefData } from '@accredited-programmes/models'
import type {
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
  ReferralSharedPageData,
} from '@accredited-programmes/ui'
import type { User } from '@manage-users-api'

jest.mock('../../utils/sentenceInformationUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

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
  const userService = createMock<UserService>({})

  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  const buttons = [{ href: 'button-href', text: 'Button' }]
  let person: Person
  let referral: Referral
  let referringUser: User
  let sharedPageData: Omit<ReferralSharedPageData, 'navigationItems' | 'subNavigationItems'>
  let statusTransitions: Array<ReferralStatusRefData>

  let controller: SubmittedReferralsController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    referringUser = userFactory.build({ name: 'Referring user', username: referral.referrerUsername })
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)
    mockShowReferralUtils.buttons.mockReturnValue(buttons)

    sharedPageData = {
      buttons,
      courseOfferingSummaryListRows: ShowReferralUtils.courseOfferingSummaryListRows(
        coursePresenter,
        organisation.name,
      ),
      pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
      pageSubHeading: 'Referral summary',
      person,
      referral,
      submissionSummaryListRows: ShowReferralUtils.submissionSummaryListRows(referral.submittedOn, referringUser.name),
    }
    statusTransitions = referralStatusRefDataFactory.buildList(2)

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    organisationService.getOrganisation.mockResolvedValue(organisation)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    referralService.getStatusTransitions.mockResolvedValue(statusTransitions)
    userService.getFullNameFromUsername.mockResolvedValue(referringUser.name)

    controller = new SubmittedReferralsController(
      courseService,
      organisationService,
      personService,
      referralService,
      userService,
    )

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

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
        ...sharedPageData,
        navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        subNavigationItems,
        submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
      })
    })

    describe('when the referral has not been submitted', () => {
      it('responds with a 400', async () => {
        referral.status = 'referral_started'
        request.path = referPaths.show.additionalInformation({ referralId: referral.id })

        const requestHandler = controller.additionalInformation()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })

    describe('when on the assess path', () => {
      it('renders the additional information template with the correct response locals', async () => {
        request.path = assessPaths.show.additionalInformation({ referralId: referral.id })

        const requestHandler = controller.additionalInformation()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
          ...sharedPageData,
          navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
          subNavigationItems,
          submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
        })
      })
    })
  })

  describe('offenceHistory', () => {
    it('renders the offence history template with the correct response locals', async () => {
      const additionalOffences = [
        offenceDetailsFactory.build({ code: 'RC123', mostSerious: false }),
        offenceDetailsFactory.build({ code: undefined, mostSerious: false }),
      ]
      const indexOffence = offenceDetailsFactory.build({ mostSerious: true })

      personService.getOffenceHistory.mockResolvedValue({
        additionalOffences,
        indexOffence,
      })

      request.path = referPaths.show.offenceHistory({ referralId: referral.id })

      const requestHandler = controller.offenceHistory()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/offenceHistory', {
        ...sharedPageData,
        additionalOffencesSummaryLists: [
          {
            summaryListRows: OffenceUtils.summaryListRows(additionalOffences[0]),
            titleText: `Additional offence (${additionalOffences[0].code})`,
          },
          {
            summaryListRows: OffenceUtils.summaryListRows(additionalOffences[1]),
            titleText: 'Additional offence',
          },
        ],
        hasOffenceHistory: true,
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        indexOffenceSummaryListRows: OffenceUtils.summaryListRows(indexOffence),
        navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        subNavigationItems,
      })
    })

    describe('when there is no offence history', () => {
      it('renders the offence history template with the correct response locals', async () => {
        personService.getOffenceHistory.mockResolvedValue({
          additionalOffences: [],
          indexOffence: undefined,
        })

        request.path = referPaths.show.offenceHistory({ referralId: referral.id })

        const requestHandler = controller.offenceHistory()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/show/offenceHistory', {
          ...sharedPageData,
          additionalOffencesSummaryLists: [],
          hasOffenceHistory: false,
          importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
          indexOffenceSummaryListRows: null,
          navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
          subNavigationItems,
        })
      })
    })

    describe('when the referral has not been submitted', () => {
      it('responds with a 400', async () => {
        referral.status = 'referral_started'
        request.path = referPaths.show.offenceHistory({ referralId: referral.id })

        const requestHandler = controller.offenceHistory()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('personalDetails', () => {
    it('renders the personal details template with the correct response locals', async () => {
      request.path = referPaths.show.personalDetails({ referralId: referral.id })

      const requestHandler = controller.personalDetails()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/personalDetails', {
        ...sharedPageData,
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        personSummaryListRows: PersonUtils.summaryListRows(person),
        subNavigationItems,
      })
    })

    describe('when the referral has not been submitted', () => {
      it('responds with a 400', async () => {
        referral.status = 'referral_started'
        request.path = referPaths.show.personalDetails({ referralId: referral.id })

        const requestHandler = controller.personalDetails()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })

    describe('when the referral has been requested with an `updatePerson` query', () => {
      it('calls `referralService.getReferral` with the same value', async () => {
        request.query.updatePerson = 'true'
        request.path = referPaths.show.personalDetails({ referralId: referral.id })

        const requestHandler = controller.personalDetails()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path, 'true')
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

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

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
        navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        subNavigationItems,
      })
    })

    describe('when the referral has not been submitted', () => {
      it('responds with a 400', async () => {
        referral.status = 'referral_started'
        request.path = referPaths.show.programmeHistory({ referralId: referral.id })

        const requestHandler = controller.programmeHistory()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('sentenceInformation', () => {
    const detailsSummaryListRows = [createMock<GovukFrontendSummaryListRowWithKeyAndValue>()]

    describe('when there are some sentence details and release dates', () => {
      it('renders the sentence information template with the present sentence details and release dates', async () => {
        person.conditionalReleaseDate = undefined
        person.paroleEligibilityDate = '2024-01-02'

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
          hasReleaseDates: true,
          hasSentenceDetails: true,
          importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
          releaseDatesSummaryListRows: PersonUtils.releaseDatesSummaryListRows(sharedPageData.person),
          subNavigationItems,
        })
      })
    })

    describe('when there are no sentence details or release dates', () => {
      it('renders the sentence information template with no sentence details and no release dates', async () => {
        releaseDateFields.forEach(field => {
          person[field] = undefined
        })
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
          hasReleaseDates: false,
          hasSentenceDetails: false,
          importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
          navigationItems: ShowReferralUtils.viewReferralNavigationItems(request.path, referral.id),
          releaseDatesSummaryListRows: [],
          subNavigationItems,
        })
      })
    })

    describe('when the referral has not been submitted', () => {
      it('responds with a 400', async () => {
        referral.status = 'referral_started'
        request.path = referPaths.show.sentenceInformation({ referralId: referral.id })

        const requestHandler = controller.sentenceInformation()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  function assertSharedDataServicesAreCalledWithExpectedArguments(
    path?: Request['path'],
    updatePersonQueryValue?: string,
  ) {
    const isRefer = path?.startsWith(referPathBase.pattern)

    expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id, {
      updatePerson: updatePersonQueryValue,
    })
    expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(courseService.getOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(personService.getPerson).toHaveBeenCalledWith(username, person.prisonNumber, response.locals.user.caseloads)
    expect(organisationService.getOrganisation).toHaveBeenCalledWith(userToken, organisation.id)
    expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(path, referral, isRefer ? statusTransitions : undefined)

    if (isRefer) {
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id)
    } else {
      expect(referralService.getStatusTransitions).not.toHaveBeenCalled()
    }
  }
})
