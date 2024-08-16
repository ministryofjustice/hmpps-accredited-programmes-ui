import type { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths, referPaths } from '../../server/paths'
import {
  attitudeFactory,
  behaviourFactory,
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  drugAlcoholDetailFactory,
  healthFactory,
  inmateDetailFactory,
  learningNeedsFactory,
  lifestyleFactory,
  offenceDetailFactory,
  offenceDtoFactory,
  offenceHistoryDetailFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  psychiatricFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusRefDataFactory,
  relationshipsFactory,
  risksAndAlertsFactory,
  roshAnalysisFactory,
  sentenceDetailsFactory,
  userFactory,
} from '../../server/testutils/factories'
import { CourseUtils, OrganisationUtils, StringUtils } from '../../server/utils'
import { releaseDateFields } from '../../server/utils/personUtils'
import auth from '../mockApis/auth'
import BadRequestPage from '../pages/badRequest'
import Page from '../pages/page'
import {
  AdditionalInformationPage,
  AlcoholMisusePage,
  AttitudesPage,
  DrugMisusePage,
  HealthPage,
  LearningNeedsPage,
  LifestyleAndAssociatesPage,
  OffenceAnalysisPage,
  OffenceHistoryPage,
  PersonalDetailsPage,
  ProgrammeHistoryPage,
  RelationshipsPage,
  ReleaseDatesPage,
  RisksAndAlertsPage,
  RoshAnalysisPage,
  SentenceInformationPage,
  StatusHistoryPage,
  ThinkingAndBehavingPage,
} from '../pages/shared'
import EmotionalWellbeing from '../pages/shared/showReferral/risksAndNeeds/emotionalWellbeing'
import type { Person, Referral, ReferralStatusRefData, SentenceDetails } from '@accredited-programmes/models'
import type { CourseParticipationPresenter, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { User, UserEmail } from '@manage-users-api'
import type { PrisonerWithBookingId } from '@prisoner-search'

type ApplicationRole = `${ApplicationRoles}`

const course = courseFactory.build()
const coursePresenter = CourseUtils.presentCourse(course)
const courseOffering = courseOfferingFactory.build()
const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
let prisoner: PrisonerWithBookingId
const defaultPrisoner = prisonerFactory.withBookingId().build({
  bookingId: 'A-BOOKING-ID',
  conditionalReleaseDate: '2024-10-31',
  dateOfBirth: '1980-01-01',
  firstName: 'Del',
  homeDetentionCurfewEligibilityDate: '2025-10-31',
  indeterminateSentence: false,
  lastName: 'Hatton',
  paroleEligibilityDate: '2026-10-31',
  sentenceExpiryDate: '2027-10-31',
  sentenceStartDate: '2010-10-31',
  tariffDate: '2028-10-31',
}) as PrisonerWithBookingId
let person: Person
const defaultPerson = personFactory.build({
  conditionalReleaseDate: '2024-10-31',
  currentPrison: defaultPrisoner.prisonName,
  dateOfBirth: '1 January 1980',
  ethnicity: defaultPrisoner.ethnicity,
  gender: defaultPrisoner.gender,
  homeDetentionCurfewEligibilityDate: defaultPrisoner.homeDetentionCurfewEligibilityDate,
  indeterminateSentence: false,
  name: 'Del Hatton',
  paroleEligibilityDate: defaultPrisoner.paroleEligibilityDate,
  prisonNumber: defaultPrisoner.prisonerNumber,
  religionOrBelief: defaultPrisoner.religion,
  sentenceExpiryDate: defaultPrisoner.sentenceExpiryDate,
  sentenceStartDate: defaultPrisoner.sentenceStartDate,
  setting: 'Custody',
  tariffDate: defaultPrisoner.tariffDate,
})
const recentCompletedAssessmentDate = '2023-12-19'
const recentCompletedAssessmentDateString = '19 December 2023'
let referral: Referral
let referringUser: User
const organisation = OrganisationUtils.organisationFromPrison(prison)
const user = userFactory.build()
const addedByUser1Email: UserEmail = {
  email: 'referrer.email@test-email.co.uk',
  username: '',
  verified: true,
}
let courseParticipationPresenter1: CourseParticipationPresenter
let courseParticipationPresenter2: CourseParticipationPresenter
let statusTransitions: Array<ReferralStatusRefData>

const pathsByRole = (role: ApplicationRole): typeof assessPaths | typeof referPaths => {
  return role === 'ROLE_ACP_PROGRAMME_TEAM' ? assessPaths : referPaths
}

const sharedTests = {
  referrals: {
    beforeEach: (
      role: ApplicationRole,
      data?: { person?: Person; prisoner?: PrisonerWithBookingId; referral?: Partial<Referral> },
    ): void => {
      prisoner = data?.prisoner || defaultPrisoner
      person = data?.person || defaultPerson
      referral = referralFactory.submitted().build({
        offeringId: courseOffering.id,
        prisonNumber: person.prisonNumber,
        ...(data?.referral || {}),
      })
      referringUser = userFactory.build({ name: 'Referring User', username: referral.referrerUsername })
      addedByUser1Email.username = referral.referrerUsername
      courseParticipationPresenter1 = {
        ...courseParticipationFactory.build({
          addedBy: user.username,
          courseName: course.name,
          prisonNumber: person.prisonNumber,
        }),
        addedByDisplayName: StringUtils.convertToTitleCase(user.name),
      }
      courseParticipationPresenter2 = {
        ...courseParticipationFactory.build({
          addedBy: user.username,
          courseName: 'Another course name',
          prisonNumber: person.prisonNumber,
        }),
        addedByDisplayName: StringUtils.convertToTitleCase(user.name),
      }
      statusTransitions = [
        referralStatusRefDataFactory.build({ hold: true }),
        referralStatusRefDataFactory.build({ code: 'WITHDRAWN', hold: false }),
      ]

      cy.task('reset')
      cy.task('stubSignIn', { authorities: [role] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)
      cy.task('stubUserDetails', referringUser)
      cy.task('stubUserEmail', addedByUser1Email)
      cy.task('stubStatusTransitions', {
        referralId: referral.id,
        statusTransitions,
      })
    },

    showsAdditionalInformationPage: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      const path = pathsByRole(role).show.additionalInformation({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(AdditionalInformationPage, {
        course,
        referral,
      })
      additionalInformationPage.shouldHavePersonDetails(person)
      additionalInformationPage.shouldContainHomeLink()
      additionalInformationPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      additionalInformationPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      additionalInformationPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      additionalInformationPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      additionalInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      additionalInformationPage.shouldContainAdditionalInformationSummaryCard()
      additionalInformationPage.shouldContainSubmittedText()
    },

    showsEmptyOffenceHistoryPage: (role: ApplicationRole): void => {
      const offenderBooking = inmateDetailFactory.build({
        offenceHistory: [],
        offenderNo: prisoner.prisonerNumber,
      })

      sharedTests.referrals.beforeEach(role)
      cy.task('stubOffenderBooking', offenderBooking)

      const path = pathsByRole(role).show.offenceHistory({ referralId: referral.id })
      cy.visit(path)

      const offenceHistoryPage = Page.verifyOnPage(OffenceHistoryPage, {
        course,
        offenderBooking,
        person,
      })
      offenceHistoryPage.shouldHavePersonDetails(person)
      offenceHistoryPage.shouldContainHomeLink()
      offenceHistoryPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      offenceHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      offenceHistoryPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      offenceHistoryPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      offenceHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      offenceHistoryPage.shouldContainImportedFromText('NOMIS')
      offenceHistoryPage.shouldContainNoOffenceHistoryMessage()
    },

    showsEmptyProgrammeHistoryPage: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)
      cy.task('stubParticipationsByPerson', {
        courseParticipations: [],
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.programmeHistory({ referralId: referral.id })
      cy.visit(path)

      const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
        course,
        person,
      })

      programmeHistoryPage.shouldHavePersonDetails(person)
      programmeHistoryPage.shouldContainHomeLink()
      programmeHistoryPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      programmeHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      programmeHistoryPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      programmeHistoryPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      programmeHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      programmeHistoryPage.shouldContainNoHistorySummaryCard()
    },

    showsErrorPageIfReferralNotSubmitted: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role, { referral: { status: 'referral_started' } })

      const path = pathsByRole(role).show.additionalInformation({ referralId: referral.id })
      cy.visit(path, { failOnStatusCode: false })

      const badRequestPage = Page.verifyOnPage(BadRequestPage, { errorMessage: 'Referral has not been submitted.' })
      badRequestPage.shouldContain400Heading()
    },

    showsOffenceHistoryPage: (role: ApplicationRole): void => {
      const offenceCodeOne = offenceDtoFactory.build({ code: 'O1', description: 'Offence 1' })
      const offenceCodeTwo = offenceDtoFactory.build({ code: 'O2', description: 'Offence 2' })
      const offenderBooking = inmateDetailFactory.build({
        offenceHistory: [
          offenceHistoryDetailFactory.build({
            mostSerious: true,
            offenceCode: offenceCodeOne.code,
            offenceDate: '2023-01-01',
          }),
          offenceHistoryDetailFactory.build({
            mostSerious: false,
            offenceCode: offenceCodeTwo.code,
            offenceDate: '2023-02-02',
          }),
          offenceHistoryDetailFactory.build({
            mostSerious: false,
            offenceCode: undefined,
            offenceDate: undefined,
          }),
        ],
        offenderNo: prisoner.prisonerNumber,
      })

      sharedTests.referrals.beforeEach(role)
      cy.task('stubOffenderBooking', offenderBooking)
      cy.task('stubOffenceCode', offenceCodeOne)
      cy.task('stubOffenceCode', offenceCodeTwo)

      const path = pathsByRole(role).show.offenceHistory({ referralId: referral.id })
      cy.visit(path)

      const offenceHistoryPage = Page.verifyOnPage(OffenceHistoryPage, {
        course,
        offenceCodes: [offenceCodeOne, offenceCodeTwo],
        offenderBooking,
        person,
      })
      offenceHistoryPage.shouldHavePersonDetails(person)
      offenceHistoryPage.shouldContainHomeLink()
      offenceHistoryPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      offenceHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      offenceHistoryPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      offenceHistoryPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      offenceHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      offenceHistoryPage.shouldContainImportedFromText('NOMIS')
      offenceHistoryPage.shouldContainIndexOffenceSummaryCard()
      offenceHistoryPage.shouldContainAdditionalOffenceSummaryCards()
    },

    showsPersonalDetailsPage: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      const path = pathsByRole(role).show.personalDetails({ referralId: referral.id })
      cy.visit(path)

      const personalDetailsPage = Page.verifyOnPage(PersonalDetailsPage, {
        course,
        person,
      })
      personalDetailsPage.shouldHavePersonDetails(person)
      personalDetailsPage.shouldContainHomeLink()
      personalDetailsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      personalDetailsPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      personalDetailsPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      personalDetailsPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      personalDetailsPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      personalDetailsPage.shouldContainImportedFromText('NOMIS')
      personalDetailsPage.shouldContainPersonalDetailsSummaryCard()
    },

    showsProgrammeHistoryPage: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)
      cy.task('stubUserDetails', user)
      cy.task('stubParticipationsByPerson', {
        courseParticipations: [courseParticipationPresenter1, courseParticipationPresenter2],
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.programmeHistory({ referralId: referral.id })
      cy.visit(path)

      const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
        course,
        person,
      })

      const courseParticipationsPresenter: Array<CourseParticipationPresenter> = [
        courseParticipationPresenter1,
        courseParticipationPresenter2,
      ]

      programmeHistoryPage.shouldHavePersonDetails(person)
      programmeHistoryPage.shouldContainHomeLink()
      programmeHistoryPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      programmeHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      programmeHistoryPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      programmeHistoryPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      programmeHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      programmeHistoryPage.shouldContainHistorySummaryCards(courseParticipationsPresenter, referral.id, {
        change: false,
        remove: false,
      })
    },

    showsReleaseDatesPageWithAllData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)
      const sentenceDetails = sentenceDetailsFactory.withData(2).build()
      cy.task('stubSentenceDetails', { prisonNumber: prisoner.prisonerNumber, sentenceDetails })

      const path = pathsByRole(role).show.releaseDates({ referralId: referral.id })
      cy.visit(path)

      const releaseDatesPage = Page.verifyOnPage(ReleaseDatesPage, {
        course,
        person,
        sentenceDetails,
      })
      releaseDatesPage.shouldHavePersonDetails(person)
      releaseDatesPage.shouldContainHomeLink()
      releaseDatesPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      releaseDatesPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      releaseDatesPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      releaseDatesPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      releaseDatesPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      releaseDatesPage.shouldContainImportedFromText('NOMIS')
      releaseDatesPage.shouldContainReleaseDatesSummaryCard()
    },

    showsReleaseDatesPageWithoutAllData: (role: ApplicationRole): void => {
      let undefinedReleaseDates = {}
      releaseDateFields.forEach(date => {
        undefinedReleaseDates = { ...undefinedReleaseDates, [date]: undefined }
      })

      sharedTests.referrals.beforeEach(role, {
        person: { ...defaultPerson, sentenceStartDate: undefined, ...undefinedReleaseDates },
        prisoner: { ...defaultPrisoner, sentenceStartDate: undefined, ...undefinedReleaseDates },
      })
      const sentenceDetails: SentenceDetails = { keyDates: [], sentences: [] }
      cy.task('stubSentenceDetails', { prisonNumber: prisoner.prisonerNumber, sentenceDetails })

      const path = pathsByRole(role).show.releaseDates({ referralId: referral.id })
      cy.visit(path)

      const releaseDatesPage = Page.verifyOnPage(ReleaseDatesPage, {
        course,
        person,
        sentenceDetails,
      })
      releaseDatesPage.shouldHavePersonDetails(person)
      releaseDatesPage.shouldContainHomeLink()
      releaseDatesPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      releaseDatesPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      releaseDatesPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      releaseDatesPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      releaseDatesPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      releaseDatesPage.shouldContainImportedFromText('NOMIS')
      releaseDatesPage.shouldContainNoReleaseDatesSummaryCard()
    },

    showsSentenceInformationPageWithAllData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)
      const sentenceDetails = sentenceDetailsFactory.withData(2).build()
      cy.task('stubSentenceDetails', { prisonNumber: prisoner.prisonerNumber, sentenceDetails })

      const path = pathsByRole(role).show.sentenceInformation({ referralId: referral.id })
      cy.visit(path)

      const sentenceInformationPage = Page.verifyOnPage(SentenceInformationPage, {
        course,
        person,
        sentenceDetails,
      })
      sentenceInformationPage.shouldHavePersonDetails(person)
      sentenceInformationPage.shouldContainHomeLink()
      sentenceInformationPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      sentenceInformationPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      sentenceInformationPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      sentenceInformationPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      sentenceInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      sentenceInformationPage.shouldContainImportedFromText('NOMIS')
      sentenceInformationPage.shouldContainSentenceDetailsSummaryCards()
    },

    showsSentenceInformationPageWithoutAllData: (role: ApplicationRole): void => {
      let undefinedReleaseDates = {}
      releaseDateFields.forEach(date => {
        undefinedReleaseDates = { ...undefinedReleaseDates, [date]: undefined }
      })

      sharedTests.referrals.beforeEach(role, {
        person: { ...defaultPerson, sentenceStartDate: undefined, ...undefinedReleaseDates },
        prisoner: { ...defaultPrisoner, sentenceStartDate: undefined, ...undefinedReleaseDates },
      })
      const sentenceDetails: SentenceDetails = { keyDates: [], sentences: [] }
      cy.task('stubSentenceDetails', { prisonNumber: prisoner.prisonerNumber, sentenceDetails })

      const path = pathsByRole(role).show.sentenceInformation({ referralId: referral.id })
      cy.visit(path)

      const sentenceInformationPage = Page.verifyOnPage(SentenceInformationPage, {
        course,
        person,
        sentenceDetails,
      })
      sentenceInformationPage.shouldHavePersonDetails(person)
      sentenceInformationPage.shouldContainHomeLink()
      sentenceInformationPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      sentenceInformationPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      sentenceInformationPage.shouldContainCourseOfferingSummaryList(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      )
      sentenceInformationPage.shouldContainSubmissionSummaryList(
        referral.submittedOn,
        referringUser.name,
        addedByUser1Email.email,
      )
      sentenceInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      sentenceInformationPage.shouldContainImportedFromText('NOMIS')
      sentenceInformationPage.shouldContainNoSentenceDetailsSummaryCard()
    },
  },
  risksAndNeeds: {
    beforeEach: (): void => {
      cy.task('stubAssessmentDateInfo', {
        assessmentDateInfo: { recentCompletedAssessmentDate },
        prisonNumber: person.prisonNumber,
      })
    },
    showsAlcoholMisusePageWithData: (role: ApplicationRole): void => {
      const drugAndAlcoholDetails = drugAlcoholDetailFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubDrugAndAlcoholDetails', {
        drugAndAlcoholDetails,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.alcoholMisuse({ referralId: referral.id })
      cy.visit(path)

      const alcoholMisusePage = Page.verifyOnPage(AlcoholMisusePage, {
        alcoholDetails: drugAndAlcoholDetails.alcohol,
        course,
      })
      alcoholMisusePage.shouldHavePersonDetails(person)
      alcoholMisusePage.shouldContainHomeLink()
      alcoholMisusePage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      alcoholMisusePage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      alcoholMisusePage.shouldContainShowReferralSubHeading('Risks and needs')
      alcoholMisusePage.shouldContainRisksAndNeedsOasysMessage()
      alcoholMisusePage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      alcoholMisusePage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      alcoholMisusePage.shouldContainAlcoholMisuseSummaryList()
    },
    showsAlcoholMisusePageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubDrugAndAlcoholDetails', {
        drugAndAlcoholDetails: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.alcoholMisuse({ referralId: referral.id })
      cy.visit(path)

      const alcoholMisusePage = Page.verifyOnPage(AlcoholMisusePage, {
        alcoholDetails: {},
        course,
      })
      alcoholMisusePage.shouldHavePersonDetails(person)
      alcoholMisusePage.shouldContainHomeLink()
      alcoholMisusePage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      alcoholMisusePage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      alcoholMisusePage.shouldContainShowReferralSubHeading('Risks and needs')
      alcoholMisusePage.shouldContainRisksAndNeedsOasysMessage()
      alcoholMisusePage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      alcoholMisusePage.shouldContainNoAlcoholMisuseDataSummaryCard()
    },
    showsAttitudesPageWithData: (role: ApplicationRole): void => {
      const attitude = attitudeFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubAttitude', {
        attitude,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.attitudes({ referralId: referral.id })
      cy.visit(path)

      const attitudePage = Page.verifyOnPage(AttitudesPage, {
        attitude,
        course,
      })
      attitudePage.shouldHavePersonDetails(person)
      attitudePage.shouldContainHomeLink()
      attitudePage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      attitudePage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      attitudePage.shouldContainShowReferralSubHeading('Risks and needs')
      attitudePage.shouldContainRisksAndNeedsOasysMessage()
      attitudePage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      attitudePage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      attitudePage.shouldContainAttitudesSummaryList()
    },
    showsAttitudesPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubAttitude', {
        attitude: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.attitudes({ referralId: referral.id })
      cy.visit(path)

      const attitudesPage = Page.verifyOnPage(AttitudesPage, {
        attitude: {},
        course,
      })
      attitudesPage.shouldHavePersonDetails(person)
      attitudesPage.shouldContainHomeLink()
      attitudesPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      attitudesPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      attitudesPage.shouldContainShowReferralSubHeading('Risks and needs')
      attitudesPage.shouldContainRisksAndNeedsOasysMessage()
      attitudesPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      attitudesPage.shouldContainNoAttitudeDataSummaryCard()
    },
    showsDrugMisusePageWithData: (role: ApplicationRole): void => {
      const drugAndAlcoholDetails = drugAlcoholDetailFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubDrugAndAlcoholDetails', {
        drugAndAlcoholDetails,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.drugMisuse({ referralId: referral.id })
      cy.visit(path)

      const drugMisusePage = Page.verifyOnPage(DrugMisusePage, {
        course,
        drugDetails: drugAndAlcoholDetails.drug,
      })
      drugMisusePage.shouldHavePersonDetails(person)
      drugMisusePage.shouldContainHomeLink()
      drugMisusePage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      drugMisusePage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      drugMisusePage.shouldContainShowReferralSubHeading('Risks and needs')
      drugMisusePage.shouldContainRisksAndNeedsOasysMessage()
      drugMisusePage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      drugMisusePage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      drugMisusePage.shouldContainDrugMisuseSummaryList()
    },
    showsDrugMisusePageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubDrugAndAlcoholDetails', {
        drugAndAlcoholDetails: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.drugMisuse({ referralId: referral.id })
      cy.visit(path)

      const drugMisusePage = Page.verifyOnPage(DrugMisusePage, {
        course,
        drugDetails: {},
      })
      drugMisusePage.shouldHavePersonDetails(person)
      drugMisusePage.shouldContainHomeLink()
      drugMisusePage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      drugMisusePage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      drugMisusePage.shouldContainShowReferralSubHeading('Risks and needs')
      drugMisusePage.shouldContainRisksAndNeedsOasysMessage()
      drugMisusePage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      drugMisusePage.shouldContainNoDrugMisuseDataSummaryCard()
    },
    showsEmotionalWellbeingPageWithData: (role: ApplicationRole): void => {
      const psychiatric = psychiatricFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubPsychiatric', {
        prisonNumber: prisoner.prisonerNumber,
        psychiatric,
      })

      const path = pathsByRole(role).show.risksAndNeeds.emotionalWellbeing({ referralId: referral.id })
      cy.visit(path)

      const emotionalWellbeingPage = Page.verifyOnPage(EmotionalWellbeing, {
        course,
        psychiatric,
      })
      emotionalWellbeingPage.shouldHavePersonDetails(person)
      emotionalWellbeingPage.shouldContainHomeLink()
      emotionalWellbeingPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      emotionalWellbeingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      emotionalWellbeingPage.shouldContainShowReferralSubHeading('Risks and needs')
      emotionalWellbeingPage.shouldContainRisksAndNeedsOasysMessage()
      emotionalWellbeingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      emotionalWellbeingPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      emotionalWellbeingPage.shouldContainPsychiatricProblemsSummaryList()
    },
    showsEmotionalWellbeingPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubPsychiatric', {
        prisonNumber: prisoner.prisonerNumber,
        psychiatric: null,
      })

      const path = pathsByRole(role).show.risksAndNeeds.emotionalWellbeing({ referralId: referral.id })
      cy.visit(path)

      const emotionalWellbeingPage = Page.verifyOnPage(EmotionalWellbeing, {
        course,
        psychiatric: {},
      })
      emotionalWellbeingPage.shouldHavePersonDetails(person)
      emotionalWellbeingPage.shouldContainHomeLink()
      emotionalWellbeingPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      emotionalWellbeingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      emotionalWellbeingPage.shouldContainShowReferralSubHeading('Risks and needs')
      emotionalWellbeingPage.shouldContainRisksAndNeedsOasysMessage()
      emotionalWellbeingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      emotionalWellbeingPage.shouldContainNoPsychiatricDataSummaryCard()
    },
    showsHealthPageWithData: (role: ApplicationRole): void => {
      const health = healthFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubHealth', {
        health,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.health({ referralId: referral.id })
      cy.visit(path)

      const healthPage = Page.verifyOnPage(HealthPage, {
        course,
        health,
      })
      healthPage.shouldHavePersonDetails(person)
      healthPage.shouldContainHomeLink()
      healthPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      healthPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      healthPage.shouldContainShowReferralSubHeading('Risks and needs')
      healthPage.shouldContainRisksAndNeedsOasysMessage()
      healthPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      healthPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      healthPage.shouldContainHealthSummaryList()
    },
    showsHealthPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubHealth', {
        health: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.health({ referralId: referral.id })
      cy.visit(path)

      const healthPage = Page.verifyOnPage(HealthPage, {
        course,
        health: {},
      })
      healthPage.shouldHavePersonDetails(person)
      healthPage.shouldContainHomeLink()
      healthPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      healthPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      healthPage.shouldContainShowReferralSubHeading('Risks and needs')
      healthPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      healthPage.shouldContainNoHealthDataSummaryCard()
    },
    showsLearningNeedsPageWithData: (role: ApplicationRole): void => {
      const learningNeeds = learningNeedsFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubLearningNeeds', {
        learningNeeds,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.learningNeeds({ referralId: referral.id })
      cy.visit(path)

      const learningNeedsPage = Page.verifyOnPage(LearningNeedsPage, {
        course,
        learningNeeds,
      })
      learningNeedsPage.shouldHavePersonDetails(person)
      learningNeedsPage.shouldContainHomeLink()
      learningNeedsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      learningNeedsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      learningNeedsPage.shouldContainShowReferralSubHeading('Risks and needs')
      learningNeedsPage.shouldContainRisksAndNeedsOasysMessage()
      learningNeedsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      learningNeedsPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      learningNeedsPage.shouldContainInformationSummaryList()
      learningNeedsPage.shouldContainScoreSummaryList()
    },
    showsLearningNeedsPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubLearningNeeds', {
        learningNeeds: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.learningNeeds({ referralId: referral.id })
      cy.visit(path)

      const learningNeedsPage = Page.verifyOnPage(LearningNeedsPage, {
        course,
        learningNeeds: {},
      })
      learningNeedsPage.shouldHavePersonDetails(person)
      learningNeedsPage.shouldContainHomeLink()
      learningNeedsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      learningNeedsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      learningNeedsPage.shouldContainShowReferralSubHeading('Risks and needs')
      learningNeedsPage.shouldContainRisksAndNeedsOasysMessage()
      learningNeedsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      learningNeedsPage.shouldContainNoLearningNeedsDataSummaryCard()
    },
    showsLifestyleAndAssociatesPageWithData: (role: ApplicationRole): void => {
      const lifestyle = lifestyleFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubLifestyle', {
        lifestyle,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.lifestyleAndAssociates({ referralId: referral.id })
      cy.visit(path)

      const lifestyleAndAssociatesPage = Page.verifyOnPage(LifestyleAndAssociatesPage, {
        course,
        lifestyle,
      })
      lifestyleAndAssociatesPage.shouldHavePersonDetails(person)
      lifestyleAndAssociatesPage.shouldContainHomeLink()
      lifestyleAndAssociatesPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      lifestyleAndAssociatesPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      lifestyleAndAssociatesPage.shouldContainShowReferralSubHeading('Risks and needs')
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsOasysMessage()
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      lifestyleAndAssociatesPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      lifestyleAndAssociatesPage.shouldContainReoffendingSummaryList()
      lifestyleAndAssociatesPage.shouldContainCriminalAssociatesSummaryList()
      lifestyleAndAssociatesPage.shouldContainLifestyleIssuesSummaryCard()
    },
    showsLifestyleAndAssociatesPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubLifestyle', {
        lifestyle: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.lifestyleAndAssociates({ referralId: referral.id })
      cy.visit(path)

      const lifestyleAndAssociatesPage = Page.verifyOnPage(LifestyleAndAssociatesPage, {
        course,
        lifestyle: {},
      })
      lifestyleAndAssociatesPage.shouldHavePersonDetails(person)
      lifestyleAndAssociatesPage.shouldContainHomeLink()
      lifestyleAndAssociatesPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      lifestyleAndAssociatesPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      lifestyleAndAssociatesPage.shouldContainShowReferralSubHeading('Risks and needs')
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsOasysMessage()
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      lifestyleAndAssociatesPage.shouldContainNoLifestyleDataSummaryCard()
    },
    showsOffenceAnalysisPageWithData: (role: ApplicationRole): void => {
      const offenceDetail = offenceDetailFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubOffenceDetails', {
        offenceDetail,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.offenceAnalysis({ referralId: referral.id })
      cy.visit(path)

      const offenceAnalysisPage = Page.verifyOnPage(OffenceAnalysisPage, {
        course,
        offenceDetail,
      })
      offenceAnalysisPage.shouldHavePersonDetails(person)
      offenceAnalysisPage.shouldContainHomeLink()
      offenceAnalysisPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      offenceAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      offenceAnalysisPage.shouldContainShowReferralSubHeading('Risks and needs')
      offenceAnalysisPage.shouldContainRisksAndNeedsOasysMessage()
      offenceAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      offenceAnalysisPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      offenceAnalysisPage.shouldContainBriefOffenceDetailsSummaryCard()
      offenceAnalysisPage.shouldContainVictimsAndPartnersSummaryList()
      offenceAnalysisPage.shouldContainImpactAndConsequencesSummaryList()
      offenceAnalysisPage.shouldContainOtherOffendersAndInfluencesSummaryList()
      offenceAnalysisPage.shouldContainMotivationAndTriggersSummaryCard()
      offenceAnalysisPage.shouldContainResponsibilitySummaryList()
      offenceAnalysisPage.shouldContainPatternOffendingSummaryCard()
    },
    showsOffenceAnalysisPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubOffenceDetails', {
        offenceDetail: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.offenceAnalysis({ referralId: referral.id })
      cy.visit(path)

      const offenceAnalysisPage = Page.verifyOnPage(OffenceAnalysisPage, {
        course,
        offenceDetail: {},
      })
      offenceAnalysisPage.shouldHavePersonDetails(person)
      offenceAnalysisPage.shouldContainHomeLink()
      offenceAnalysisPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      offenceAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      offenceAnalysisPage.shouldContainShowReferralSubHeading('Risks and needs')
      offenceAnalysisPage.shouldContainNoOffenceDetailsSummaryCard()
      offenceAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
    },
    showsRelationshipsPageWithData: (role: ApplicationRole): void => {
      const relationships = relationshipsFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubRelationships', {
        prisonNumber: prisoner.prisonerNumber,
        relationships,
      })

      const path = pathsByRole(role).show.risksAndNeeds.relationships({ referralId: referral.id })
      cy.visit(path)

      const relationshipsPage = Page.verifyOnPage(RelationshipsPage, {
        course,
        relationships,
      })
      relationshipsPage.shouldHavePersonDetails(person)
      relationshipsPage.shouldContainHomeLink()
      relationshipsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      relationshipsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      relationshipsPage.shouldContainShowReferralSubHeading('Risks and needs')
      relationshipsPage.shouldContainRisksAndNeedsOasysMessage()
      relationshipsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      relationshipsPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      relationshipsPage.shouldContainFamilyRelationshipsSummaryList()
      relationshipsPage.shouldContainCloseRelationshipsSummaryList()
      relationshipsPage.shouldContainDomesticViolenceSummaryList()
      relationshipsPage.shouldContainRelationshipToChildrenSummaryList()
      relationshipsPage.shouldContainRelationshipIssuesSummaryCard()
    },
    showsRelationshipsPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubRelationships', {
        prisonNumber: prisoner.prisonerNumber,
        relationships: null,
      })

      const path = pathsByRole(role).show.risksAndNeeds.relationships({ referralId: referral.id })
      cy.visit(path)

      const relationshipsPage = Page.verifyOnPage(RelationshipsPage, {
        course,
        relationships: {},
      })
      relationshipsPage.shouldHavePersonDetails(person)
      relationshipsPage.shouldContainHomeLink()
      relationshipsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      relationshipsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      relationshipsPage.shouldContainShowReferralSubHeading('Risks and needs')
      relationshipsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      relationshipsPage.shouldContainNoRelationshipsSummaryCard()
    },
    showsRisksAndAlertsPageWithApiError: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubRisksAndAlerts', {
        prisonNumber: prisoner.prisonerNumber,
        risksAndAlerts: null,
        status: 500,
      })

      const path = pathsByRole(role).show.risksAndNeeds.risksAndAlerts({ referralId: referral.id })
      cy.visit(path)

      const risksAndAlertsPage = Page.verifyOnPage(RisksAndAlertsPage, {
        course,
        risksAndAlerts: {},
      })
      risksAndAlertsPage.shouldContainOasysNomisErrorBanner()
      risksAndAlertsPage.shouldContainHomeLink()
      risksAndAlertsPage.shouldHavePersonDetails(person)
      risksAndAlertsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      risksAndAlertsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      risksAndAlertsPage.shouldContainShowReferralSubHeading('Risks and needs')
      risksAndAlertsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      risksAndAlertsPage.shouldContainOasysNomisErrorText()
    },
    showsRisksAndAlertsPageWithData: (role: ApplicationRole): void => {
      const risksAndAlerts = risksAndAlertsFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubRisksAndAlerts', {
        prisonNumber: prisoner.prisonerNumber,
        risksAndAlerts,
      })

      const path = pathsByRole(role).show.risksAndNeeds.risksAndAlerts({ referralId: referral.id })
      cy.visit(path)

      const risksAndAlertsPage = Page.verifyOnPage(RisksAndAlertsPage, {
        course,
        risksAndAlerts,
      })
      risksAndAlertsPage.shouldHavePersonDetails(person)
      risksAndAlertsPage.shouldContainHomeLink()
      risksAndAlertsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      risksAndAlertsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      risksAndAlertsPage.shouldContainShowReferralSubHeading('Risks and needs')
      risksAndAlertsPage.shouldContainRisksAndNeedsOasysMessage()
      risksAndAlertsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      risksAndAlertsPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      risksAndAlertsPage.shouldHaveOgrsInformation()
      risksAndAlertsPage.shouldHaveOvpInformation()
      risksAndAlertsPage.shouldHaveSaraInformation()
      risksAndAlertsPage.shouldHaveRsrInformation()
      risksAndAlertsPage.shouldHaveRoshInformation()
      risksAndAlertsPage.shouldContainImportedFromText('NOMIS', 'imported-from-nomis-text')
      risksAndAlertsPage.shouldHaveAlertsInformation()
    },
    showsRisksAndAlertsPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubRisksAndAlerts', {
        prisonNumber: prisoner.prisonerNumber,
        risksAndAlerts: null,
      })

      const path = pathsByRole(role).show.risksAndNeeds.risksAndAlerts({ referralId: referral.id })
      cy.visit(path)

      const risksAndAlertsPage = Page.verifyOnPage(RisksAndAlertsPage, {
        course,
        risksAndAlerts: {},
      })
      risksAndAlertsPage.shouldHavePersonDetails(person)
      risksAndAlertsPage.shouldContainHomeLink()
      risksAndAlertsPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      risksAndAlertsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      risksAndAlertsPage.shouldContainShowReferralSubHeading('Risks and needs')
      risksAndAlertsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      risksAndAlertsPage.shouldContainNoRisksAndAlertsSummaryCard()
    },
    showsRoshAnalysisPageWithData: (role: ApplicationRole): void => {
      const roshAnalysis = roshAnalysisFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubRoshAnalysis', {
        prisonNumber: prisoner.prisonerNumber,
        roshAnalysis,
      })

      const path = pathsByRole(role).show.risksAndNeeds.roshAnalysis({ referralId: referral.id })
      cy.visit(path)

      const roshAnalysisPage = Page.verifyOnPage(RoshAnalysisPage, {
        course,
        roshAnalysis,
      })
      roshAnalysisPage.shouldHavePersonDetails(person)
      roshAnalysisPage.shouldContainHomeLink()
      roshAnalysisPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      roshAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      roshAnalysisPage.shouldContainShowReferralSubHeading('Risks and needs')
      roshAnalysisPage.shouldContainRisksAndNeedsOasysMessage()
      roshAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      roshAnalysisPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      roshAnalysisPage.shouldContainPreviousBehaviourSummaryList()
    },
    showsRoshAnalysisPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubRoshAnalysis', {
        prisonNumber: prisoner.prisonerNumber,
        roshAnalysis: null,
      })

      const path = pathsByRole(role).show.risksAndNeeds.roshAnalysis({ referralId: referral.id })
      cy.visit(path)

      const roshAnalysisPage = Page.verifyOnPage(RoshAnalysisPage, {
        course,
        roshAnalysis: {},
      })
      roshAnalysisPage.shouldHavePersonDetails(person)
      roshAnalysisPage.shouldContainHomeLink()
      roshAnalysisPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      roshAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      roshAnalysisPage.shouldContainShowReferralSubHeading('Risks and needs')
      roshAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      roshAnalysisPage.shouldContainNoRoshAnalysisSummaryCard()
    },
    showsThinkingAndBehavingPageWithData: (role: ApplicationRole): void => {
      const behaviour = behaviourFactory.build()
      sharedTests.referrals.beforeEach(role)
      sharedTests.risksAndNeeds.beforeEach()

      cy.task('stubBehaviour', {
        behaviour,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.thinkingAndBehaving({ referralId: referral.id })
      cy.visit(path)

      const thinkingAndBehavingPage = Page.verifyOnPage(ThinkingAndBehavingPage, {
        behaviour,
        course,
      })
      thinkingAndBehavingPage.shouldHavePersonDetails(person)
      thinkingAndBehavingPage.shouldContainHomeLink()
      thinkingAndBehavingPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      thinkingAndBehavingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      thinkingAndBehavingPage.shouldContainShowReferralSubHeading('Risks and needs')
      thinkingAndBehavingPage.shouldContainRisksAndNeedsOasysMessage()
      thinkingAndBehavingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      thinkingAndBehavingPage.shouldContainAssessmentCompletedText(recentCompletedAssessmentDateString)
      thinkingAndBehavingPage.shouldContainThinkingAndBehavingSummaryList()
    },
    showsThinkingAndBehavingPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      cy.task('stubBehaviour', {
        behaviour: null,
        prisonNumber: prisoner.prisonerNumber,
      })

      const path = pathsByRole(role).show.risksAndNeeds.thinkingAndBehaving({ referralId: referral.id })
      cy.visit(path)

      const thinkingAndBehavingPage = Page.verifyOnPage(ThinkingAndBehavingPage, {
        behaviour: {},
        course,
      })
      thinkingAndBehavingPage.shouldHavePersonDetails(person)
      thinkingAndBehavingPage.shouldContainHomeLink()
      thinkingAndBehavingPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      thinkingAndBehavingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      thinkingAndBehavingPage.shouldContainShowReferralSubHeading('Risks and needs')
      thinkingAndBehavingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      thinkingAndBehavingPage.shouldContainNoBehaviourDataSummaryCard()
    },
  },
  statusHistory: {
    showPageWithData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

      const startedStatusHistory = referralStatusHistoryFactory.started().build({ username: referringUser.username })
      const submittedStatusHistory = referralStatusHistoryFactory
        .submitted()
        .build({ username: referringUser.username })
      const updatedStatusHistory = referralStatusHistoryFactory
        .updated()
        .build({ status: 'assessment_started', username: auth.mockedUser.username })

      const referralStatusHistory = [updatedStatusHistory, submittedStatusHistory, startedStatusHistory]
      const referralStatusHistoryPresenter: Array<ReferralStatusHistoryPresenter> = [
        {
          ...referralStatusHistory[0],
          byLineText: 'You',
        },
        {
          ...referralStatusHistory[1],
          byLineText: referringUser.name,
        },
        {
          ...referralStatusHistory[2],
          byLineText: referringUser.name,
        },
      ]

      cy.task('stubStatusHistory', {
        referralId: referral.id,
        statusHistory: referralStatusHistory,
      })

      const path = pathsByRole(role).show.statusHistory({ referralId: referral.id })
      cy.visit(path)

      const statusHistoryPage = Page.verifyOnPage(StatusHistoryPage, { course })
      statusHistoryPage.shouldHavePersonDetails(person)
      statusHistoryPage.shouldContainShowReferralButtons(path, referral, statusTransitions)
      statusHistoryPage.shouldContainHomeLink()
      statusHistoryPage.shouldContainShowReferralSubNavigation(path, 'statusHistory', referral.id)
      statusHistoryPage.shouldContainShowReferralSubHeading('Status history')
      statusHistoryPage.shouldContainStatusHistoryTimeline(referralStatusHistoryPresenter)
    },
  },
}

export default sharedTests
