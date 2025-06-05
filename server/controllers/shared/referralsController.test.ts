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
  hspReferralDetailsFactory,
  offenceDetailsFactory,
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
import type { GovukFrontendSummaryListRowWithKeyAndValue, ReferralSharedPageData } from '@accredited-programmes/ui'
import type { Organisation, Referral } from '@accredited-programmes-api'
import type { GovukFrontendSummaryList, GovukFrontendTable } from '@govuk-frontend'
import type { User } from '@manage-users-api'

jest.mock('../../utils/courseParticipationUtils')
jest.mock('../../utils/personUtils')
jest.mock('../../utils/sentenceInformationUtils')
jest.mock('../../utils/referrals/showReferralUtils')
jest.mock('../../utils/sexualOffenceDetailsUtils')

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
  const organisation: Organisation = { code: 'WTI', gender: 'Male', prisonName: 'Whatton' }
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.code })
  const navigationItems = [{ active: true, href: 'nav-href', text: 'Nav Item' }]
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  const buttons = [{ href: 'button-href', text: 'Button' }]
  const buttonMenu = {
    button: {
      classes: 'govuk-button--secondary',
      text: 'Update referral',
    },
    items: [],
  }
  const referrerEmail = 'referrer.email@test-email.co.uk'
  const recentCaseListPath = '/case-list-path'
  let person: Person
  let originalReferral: Referral
  let referral: Referral
  let referringUser: User
  let sharedPageData: ReferralSharedPageData
  let statusTransitions: Array<ReferralStatusRefData>

  let controller: SubmittedReferralsController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory
      .submitted()
      .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber, submittedOn: '2025-04-01' })
    originalReferral = referralFactory
      .closed()
      .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    referringUser = userFactory.build({ name: 'Referring user', username: referral.referrerUsername })
    mockShowReferralUtils.viewReferralNavigationItems.mockReturnValue(navigationItems)
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)
    mockShowReferralUtils.buttons.mockReturnValue(buttons)
    mockShowReferralUtils.buttonMenu.mockReturnValue(buttonMenu)

    sharedPageData = {
      additionalInformation: referral.additionalInformation,
      buttonMenu,
      buttons,
      course,
      courseOffering,
      courseOfferingSummaryListRows: ShowReferralUtils.courseOfferingSummaryListRows(
        person.name,
        coursePresenter,
        referrerEmail,
        organisation.prisonName!,
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
    organisationService.getOrganisationFromAcp.mockResolvedValue(organisation)
    personService.getPerson.mockResolvedValue(person)
    when(referralService.getReferral).calledWith(username, referral.id, expect.any(Object)).mockResolvedValue(referral)
    when(referralService.getReferral).calledWith(username, originalReferral.id).mockResolvedValue(originalReferral)
    referralService.getStatusTransitions.mockResolvedValue(statusTransitions)
    referralService.getPathways.mockResolvedValue({
      recommended: 'MODERATE_INTENSITY_BC',
      requested: 'MODERATE',
    })
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
    beforeEach(() => {
      request.path = referPaths.show.additionalInformation({ referralId: referral.id })
    })

    it('renders the additional information template with the correct response locals', async () => {
      const requestHandler = controller.additionalInformation()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
        ...sharedPageData,
        isOverride: false,
        pniMismatchSummaryListRows: [],
        submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
      })
    })

    describe('when the referral has been marked as not eligible or not suitable', () => {
      it.each([
        {
          status: 'not_eligible',
          statusDescription: 'Not eligible',
        },
        {
          status: 'not_suitable',
          statusDescription: 'Not suitable',
        },
      ])(
        'renders the additional information template with the correct response locals for status: $status',
        async ({ status, statusDescription }) => {
          referral.status = status
          referral.statusDescription = statusDescription

          const requestHandler = controller.additionalInformation()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(
            'referrals/show/additionalInformation',
            expect.objectContaining({
              treatmentManagerDecisionText: `The person has been assessed as ${statusDescription.toLowerCase()} by the Treatment Manager.`,
            }),
          )
        },
      )
    })

    describe('when the referral has not been submitted', () => {
      it('responds with a 400', async () => {
        referral.status = 'referral_started'

        const requestHandler = controller.additionalInformation()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })

    describe('when on the assess path', () => {
      beforeEach(() => {
        request.path = assessPaths.show.additionalInformation({ referralId: referral.id })
      })

      it('renders the additional information template with the correct response locals', async () => {
        const requestHandler = controller.additionalInformation()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
          ...sharedPageData,
          isOverride: false,
          pniMismatchSummaryListRows: [],
          submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
        })
      })

      describe('and the referral has been transferred', () => {
        it('renders the additional information template with the correct response locals', async () => {
          referral.originalReferralId = originalReferral.id
          referral.additionalInformation = undefined
          sharedPageData.additionalInformation = `There is no additional information for this referral because it was transferred from a previous referral to ${course.name}. </br></br>
    You can see <a href="${assessPaths.show.additionalInformation({ referralId: originalReferral.id })}">notes from the previous referral.</a>`

          const requestHandler = controller.additionalInformation()
          await requestHandler(request, response, next)

          assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

          expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
            ...sharedPageData,
            isOverride: false,
            pniMismatchSummaryListRows: [],
            submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
          })
        })
      })
    })

    describe('and the referral is an override', () => {
      const pniMismatchSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue> = [
        {
          key: { text: 'Fake summary list key' },
          value: { text: 'Fake summary list value' },
        },
      ]

      beforeEach(() => {
        referralService.getPathways.mockResolvedValue({
          recommended: 'MODERATE_INTENSITY_BC',
          requested: 'HIGH',
        })

        mockShowReferralUtils.pniMismatchSummaryListRows.mockReturnValue(pniMismatchSummaryListRows)
      })

      it('renders the additional information template with the correct response locals', async () => {
        const requestHandler = controller.additionalInformation()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/show/additionalInformation', {
          ...sharedPageData,
          isOverride: true,
          pniMismatchSummaryListRows,
          submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
        })
      })
    })
  })

  describe('otherReferrals', () => {
    beforeEach(() => {
      request.path = referPaths.show.otherReferrals({ referralId: referral.id })
    })

    it('renders the other referrals template with the correct response locals', async () => {
      when(referralService.getOtherReferrals)
        .calledWith(request.user as Express.User, referral.id)
        .mockResolvedValue([
          {
            course: courseFactory.build({ audience: 'General offence', name: 'Becoming New Me Plus' }),
            organisation: { code: 'WTI', prisonName: 'Whatton' },
            referral,
            status: referralStatusRefDataFactory.build({ colour: 'blue', description: 'Referral started' }),
            user: userFactory.build({ name: 'Joe Bloggs' }),
          },
        ])

      const requestHandler = controller.otherReferrals()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/otherReferrals', {
        ...sharedPageData,
        tableRows: [
          [
            { text: 'Becoming New Me Plus' },
            { text: 'General offence' },
            { text: 'Whatton' },
            { text: 'Joe Bloggs' },
            { attributes: { 'data-sort-value': '2025-04-01' }, text: '1 April 2025' },
            { html: '<strong class="govuk-tag govuk-tag--blue">Referral started</strong>' },
          ],
        ],
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
        summaryText: `A referral already exists for ${sharedPageData.person.name} to ${sharedPageData.course.displayName} at ${sharedPageData.organisation.prisonName}.`,
      })
    })

    describe('when there is `transferErrorData` in the session', () => {
      it('renders the duplicate template with the correct response locals', async () => {
        const originalOffering = courseOfferingFactory.build()
        const originalCourse = courseFactory.build({
          courseOfferings: [originalOffering],
          name: 'Becoming New Me Plus',
        })

        originalReferral = referralFactory.submitted().build({ offeringId: originalOffering.id })

        when(referralService.getReferral).calledWith(username, originalReferral.id).mockResolvedValue(originalReferral)
        when(courseService.getCourseByOffering)
          .calledWith(username, originalOffering.id)
          .mockResolvedValue(originalCourse)

        request.session.transferErrorData = {
          duplicateReferralId: referral.id,
          errorMessage: 'DUPLICATE',
          originalOfferingId: originalOffering.id,
          originalReferralId: originalReferral.id,
          prisonNumber: person.prisonNumber,
        }

        const requestHandler = controller.duplicate()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/show/duplicate',
          expect.objectContaining({
            hrefs: {
              back: assessPaths.show.personalDetails({ referralId: originalReferral.id }),
              programmes: findPaths.pniFind.recommendedProgrammes({}),
              withdraw: assessPaths.withdraw({ referralId: originalReferral.id }),
            },
            withdrawButtonText: 'Withdraw original referral to Becoming New Me Plus',
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

  describe('hspDetails', () => {
    beforeAll(() => {
      response = Helpers.createMockResponseWithCaseloads()
    })

    it('Renders a response', async () => {
      // Given
      request.path = 'hsp-details'
      const hspReferral = hspReferralDetailsFactory.build()
      referralService.getHspReferralDetails.mockResolvedValueOnce(hspReferral)

      // When
      const requestHandler = controller.hspDetails()
      await requestHandler(request, response, next)

      // Then
      expect(response.render).toHaveBeenCalledTimes(1)
      expect(response.render).toHaveBeenCalledWith(
        'referrals/show/hspDetails',
        expect.objectContaining({
          ...sharedPageData,
        }),
      )
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
    expect(organisationService.getOrganisationFromAcp).toHaveBeenCalledWith(username, organisation.code)
    expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(
      { currentPath: path, recentCaseListPath },
      referral,
      isRefer ? statusTransitions : undefined,
    )
    expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(path, 'referral', referral.id)
    expect(mockShowReferralUtils.buttonMenu).toHaveBeenCalledWith(course, referral, {
      currentPath: path,
      recentCaseListPath,
    })

    if (isRefer) {
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id)
    } else {
      expect(referralService.getStatusTransitions).not.toHaveBeenCalled()
    }

    if (referral.originalReferralId && !isRefer) {
      expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.originalReferralId)
      expect(referralService.getReferral).toHaveBeenCalledTimes(2)
      expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, originalReferral.offeringId)
      expect(courseService.getCourseByOffering).toHaveBeenCalledTimes(2)
    }
  }
})
