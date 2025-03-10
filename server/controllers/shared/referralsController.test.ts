import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import SubmittedReferralsController from './referralsController'
import { assessPaths, findPaths, referPathBase, referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  offenceDetailsFactory,
  organisationFactory,
  personFactory,
  referralFactory,
  referralStatusRefDataFactory,
  sentenceDetailsFactory,
  userFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import {
  CourseParticipationUtils,
  CourseUtils,
  DateUtils,
  OffenceUtils,
  PersonUtils,
  SentenceInformationUtils,
  ShowReferralUtils,
} from '../../utils'
import type { Person, ReferralStatusRefData } from '@accredited-programmes/models'
import type { ReferralSharedPageData } from '@accredited-programmes/ui'
import type { Referral } from '@accredited-programmes-api'
import type { GovukFrontendSummaryList, GovukFrontendTable } from '@govuk-frontend'
import type { User } from '@manage-users-api'

jest.mock('../../utils/courseParticipationUtils')
jest.mock('../../utils/personUtils')
jest.mock('../../utils/sentenceInformationUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockPersonUtils = PersonUtils as jest.Mocked<typeof PersonUtils>
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
  const navigationItems = [{ active: true, href: 'nav-href', text: 'Nav Item' }]
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  const buttons = [{ href: 'button-href', text: 'Button' }]
  const referrerEmail = 'referrer.email@test-email.co.uk'
  const recentCaseListPath = '/case-list-path'
  let person: Person
  let referral: Referral
  let referringUser: User
  let sharedPageData: ReferralSharedPageData
  let statusTransitions: Array<ReferralStatusRefData>

  let controller: SubmittedReferralsController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    referringUser = userFactory.build({ name: 'Referring user', username: referral.referrerUsername })
    mockShowReferralUtils.viewReferralNavigationItems.mockReturnValue(navigationItems)
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)
    mockShowReferralUtils.buttons.mockReturnValue(buttons)

    sharedPageData = {
      buttons,
      course,
      courseOffering,
      courseOfferingSummaryListRows: ShowReferralUtils.courseOfferingSummaryListRows(
        person.name,
        coursePresenter,
        referrerEmail,
        organisation.name,
      ),
      hideTitleServiceName: true,
      navigationItems,
      organisation,
      pageHeading: `Referral to ${coursePresenter.displayName}`,
      pageSubHeading: 'Referral summary',
      pageTitleOverride: `Referral details for referral to ${coursePresenter.displayName}`,
      person,
      referral,
      subNavigationItems,
      submissionSummaryListRows: ShowReferralUtils.submissionSummaryListRows(
        referral.submittedOn,
        referringUser.name,
        referrerEmail,
      ),
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

  describe('additionalInformation', () => {
    it('renders the additional information template with the correct response locals', async () => {
      request.path = referPaths.show.additionalInformation({ referralId: referral.id })

      const requestHandler = controller.additionalInformation()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
        ...sharedPageData,
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
          submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
        })
      })
    })
  })

  describe('duplicate', () => {
    beforeEach(() => {
      request.path = referPaths.show.duplicate({ referralId: referral.id })
    })

    it('renders the duplicate template with the correct response locals', async () => {
      const requestHandler = controller.duplicate()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/duplicate', {
        ...sharedPageData,
        hrefs: {
          back: referPaths.new.people.show({
            courseOfferingId: sharedPageData.courseOffering.id as string,
            prisonNumber: sharedPageData.person.prisonNumber,
          }),
          programmes: findPaths.pniFind.recommendedProgrammes({}),
        },
        pageHeading: 'Duplicate referral found',
        pageTitleOverride: 'Duplicate referral found',
        summaryText: `A referral already exists for ${sharedPageData.person.name} to ${sharedPageData.course.displayName} at ${sharedPageData.organisation.name}.`,
      })
    })

    describe('when there is `transferErrorData` in the session', () => {
      it('renders the duplicate template with the correct `back.href` local and clears `transferErrorData` from the session', async () => {
        request.session.transferErrorData = {
          duplicateReferralId: referral.id,
          errorMessage: 'DUPLICATE',
          originalOfferingId: 'original-offering-id',
          originalReferralId: 'original-referral-id',
          prisonNumber: person.prisonNumber,
        }

        const requestHandler = controller.duplicate()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(request.session.transferErrorData).toBeUndefined()

        expect(response.render).toHaveBeenCalledWith(
          'referrals/show/duplicate',
          expect.objectContaining({
            hrefs: {
              back: assessPaths.show.personalDetails({ referralId: 'original-referral-id' }),
              programmes: findPaths.pniFind.recommendedProgrammes({}),
            },
          }),
        )
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
        importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
        indexOffenceSummaryListRows: OffenceUtils.summaryListRows(indexOffence),
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
          importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
          indexOffenceSummaryListRows: null,
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
        importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
        personSummaryListRows: PersonUtils.summaryListRows(person),
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
      request.path = referPaths.show.programmeHistory({ referralId: referral.id })

      const participations = courseParticipationFactory.buildList(2)
      const participationsTable: GovukFrontendTable = {
        head: [{ text: 'Existing participations table column header' }],
        rows: [[{ text: 'Existing participations table value text' }]],
      }

      courseService.getParticipationsByPerson.mockResolvedValue(participations)

      when(CourseParticipationUtils.table)
        .calledWith(participations, request.path, referral.id, 'participations-table')
        .mockReturnValue(participationsTable)

      const requestHandler = controller.programmeHistory()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/programmeHistory', {
        ...sharedPageData,
        participationsTable,
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

  describe('releaseDates', () => {
    it('renders the release dates template with the correct response locals', async () => {
      const releaseDatesSummaryListRows = [{ key: { text: 'Release date' }, value: { text: '4 September 2099' } }]
      const sentenceDetails = sentenceDetailsFactory.build({})

      personService.getSentenceDetails.mockResolvedValue(sentenceDetails)
      mockPersonUtils.releaseDatesSummaryListRows.mockReturnValue(releaseDatesSummaryListRows)

      request.path = referPaths.show.releaseDates({ referralId: referral.id })

      const requestHandler = controller.releaseDates()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/releaseDates', {
        ...sharedPageData,
        importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
        releaseDatesSummaryListRows,
      })
    })

    describe('when the referral has not been submitted', () => {
      it('responds with a 400', async () => {
        referral.status = 'referral_started'
        request.path = referPaths.show.releaseDates({ referralId: referral.id })

        const requestHandler = controller.releaseDates()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('sentenceInformation', () => {
    const mockSentenceInformationUtils = SentenceInformationUtils as jest.Mocked<typeof SentenceInformationUtils>

    const sentenceDetails = sentenceDetailsFactory.build({})
    const sentencesSummaryLists = [createMock<GovukFrontendSummaryList>()]

    beforeEach(() => {
      personService.getSentenceDetails.mockResolvedValue(sentenceDetails)
      mockSentenceInformationUtils.summaryLists.mockReturnValue(sentencesSummaryLists)

      request.path = referPaths.show.sentenceInformation({ referralId: referral.id })
    })

    describe('when there is sentence information', () => {
      it('renders the sentence information template with the correct response locals', async () => {
        const requestHandler = controller.sentenceInformation()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/show/sentenceInformation', {
          ...sharedPageData,
          importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
          sentencesSummaryLists,
        })
        expect(mockSentenceInformationUtils.summaryLists).toHaveBeenCalledWith(sentenceDetails)
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
    expect(personService.getPerson).toHaveBeenCalledWith(username, person.prisonNumber)
    expect(organisationService.getOrganisation).toHaveBeenCalledWith(userToken, organisation.id)
    expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(
      { currentPath: path, recentCaseListPath },
      referral,
      isRefer ? statusTransitions : undefined,
    )
    expect(mockShowReferralUtils.viewReferralNavigationItems).toHaveBeenCalledWith(path, referral.id)
    expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(path, 'referral', referral.id)

    if (isRefer) {
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id)
    } else {
      expect(referralService.getStatusTransitions).not.toHaveBeenCalled()
    }
  }
})
