import type { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths, referPaths } from '../../server/paths'
import {
  attitudeFactory,
  behaviourFactory,
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  healthFactory,
  inmateDetailFactory,
  learningNeedsFactory,
  lifestyleFactory,
  offenceDetailFactory,
  offenceDtoFactory,
  offenceHistoryDetailFactory,
  offenderSentenceAndOffencesFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  psychiatricFactory,
  referralFactory,
  relationshipsFactory,
  risksAndAlertsFactory,
  roshAnalysisFactory,
  userFactory,
} from '../../server/testutils/factories'
import { CourseUtils, OrganisationUtils, StringUtils } from '../../server/utils'
import { releaseDateFields } from '../../server/utils/personUtils'
import BadRequestPage from '../pages/badRequest'
import Page from '../pages/page'
import {
  AdditionalInformationPage,
  AttitudesPage,
  HealthPage,
  LearningNeedsPage,
  LifestyleAndAssociatesPage,
  OffenceAnalysisPage,
  OffenceHistoryPage,
  PersonalDetailsPage,
  ProgrammeHistoryPage,
  RelationshipsPage,
  RisksAndAlertsPage,
  RoshAnalysisPage,
  SentenceInformationPage,
  ThinkingAndBehavingPage,
} from '../pages/shared'
import EmotionalWellbeing from '../pages/shared/showReferral/risksAndNeeds/emotionalWellbeing'
import type { Person, Referral } from '@accredited-programmes/models'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'
import type { User } from '@manage-users-api'
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
let referral: Referral
let referringUser: User
const organisation = OrganisationUtils.organisationFromPrison(prison)
const user = userFactory.build()
let courseParticipationPresenter1: CourseParticipationPresenter
let courseParticipationPresenter2: CourseParticipationPresenter

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
      additionalInformationPage.shouldContainNavigation(path)
      additionalInformationPage.shouldContainBackLink('#')
      additionalInformationPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      additionalInformationPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      additionalInformationPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
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
      offenceHistoryPage.shouldContainNavigation(path)
      offenceHistoryPage.shouldContainBackLink('#')
      offenceHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      offenceHistoryPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      offenceHistoryPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
      offenceHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      offenceHistoryPage.shouldContainImportedFromText('Nomis')
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
      programmeHistoryPage.shouldContainNavigation(path)
      programmeHistoryPage.shouldContainBackLink('#')
      programmeHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      programmeHistoryPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      programmeHistoryPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
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
      offenceHistoryPage.shouldContainNavigation(path)
      offenceHistoryPage.shouldContainBackLink('#')
      offenceHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      offenceHistoryPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      offenceHistoryPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
      offenceHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      offenceHistoryPage.shouldContainImportedFromText('Nomis')
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
      personalDetailsPage.shouldContainNavigation(path)
      personalDetailsPage.shouldContainBackLink('#')
      personalDetailsPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      personalDetailsPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      personalDetailsPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
      personalDetailsPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      personalDetailsPage.shouldContainImportedFromText('Nomis')
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
      programmeHistoryPage.shouldContainNavigation(path)
      programmeHistoryPage.shouldContainBackLink('#')
      programmeHistoryPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      programmeHistoryPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      programmeHistoryPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
      programmeHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      programmeHistoryPage.shouldContainHistorySummaryCards(courseParticipationsPresenter, referral.id, {
        change: false,
        remove: false,
      })
    },

    showsSentenceInformationPageWithAllData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)
      const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build({
        sentenceTypeDescription: 'a description',
      })
      cy.task('stubOffenderSentenceAndOffences', { bookingId: prisoner.bookingId, offenderSentenceAndOffences })

      const path = pathsByRole(role).show.sentenceInformation({ referralId: referral.id })
      cy.visit(path)

      const sentenceInformationPage = Page.verifyOnPage(SentenceInformationPage, {
        course,
        offenderSentenceAndOffences,
        person,
      })
      sentenceInformationPage.shouldHavePersonDetails(person)
      sentenceInformationPage.shouldContainNavigation(path)
      sentenceInformationPage.shouldContainBackLink('#')
      sentenceInformationPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      sentenceInformationPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      sentenceInformationPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
      sentenceInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      sentenceInformationPage.shouldContainImportedFromText('OASys')
      sentenceInformationPage.shouldContainSentenceDetailsSummaryCard()
      sentenceInformationPage.shouldContainReleaseDatesSummaryCard()
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
      const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build({
        sentenceTypeDescription: undefined,
      })
      cy.task('stubOffenderSentenceAndOffences', { bookingId: prisoner.bookingId, offenderSentenceAndOffences })

      const path = pathsByRole(role).show.sentenceInformation({ referralId: referral.id })
      cy.visit(path)

      const sentenceInformationPage = Page.verifyOnPage(SentenceInformationPage, {
        course,
        offenderSentenceAndOffences,
        person,
      })
      sentenceInformationPage.shouldHavePersonDetails(person)
      sentenceInformationPage.shouldContainNavigation(path)
      sentenceInformationPage.shouldContainBackLink('#')
      sentenceInformationPage.shouldContainShowReferralSubNavigation(path, 'referral', referral.id)
      sentenceInformationPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      sentenceInformationPage.shouldContainSubmissionSummaryList(referral.submittedOn, referringUser.name)
      sentenceInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      sentenceInformationPage.shouldContainImportedFromText('OASys')
      sentenceInformationPage.shouldContainNoSentenceDetailsSummaryCard()
      sentenceInformationPage.shouldContainNoReleaseDatesSummaryCard()
    },
  },
  risksAndNeeds: {
    showsAttitudesPageWithData: (role: ApplicationRole): void => {
      const attitude = attitudeFactory.build()
      sharedTests.referrals.beforeEach(role)

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
      attitudePage.shouldContainNavigation(path)
      attitudePage.shouldContainBackLink('#')
      attitudePage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      attitudePage.shouldContainShowReferralSubHeading()
      attitudePage.shouldContainRisksAndNeedsOasysMessage()
      attitudePage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      attitudePage.shouldContainImportedFromText('OASys')
      attitudePage.shouldContainAttitudesSummaryList()
    },
    showsAttitudesPageWithoutData: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role)

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
      attitudesPage.shouldContainNavigation(path)
      attitudesPage.shouldContainBackLink('#')
      attitudesPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      attitudesPage.shouldContainShowReferralSubHeading()
      attitudesPage.shouldContainRisksAndNeedsOasysMessage()
      attitudesPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      attitudesPage.shouldContainNoAttitudeDataSummaryCard()
    },
    showsEmotionalWellbeingPageWithData: (role: ApplicationRole): void => {
      const psychiatric = psychiatricFactory.build()
      sharedTests.referrals.beforeEach(role)

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
      emotionalWellbeingPage.shouldContainNavigation(path)
      emotionalWellbeingPage.shouldContainBackLink('#')
      emotionalWellbeingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      emotionalWellbeingPage.shouldContainShowReferralSubHeading()
      emotionalWellbeingPage.shouldContainRisksAndNeedsOasysMessage()
      emotionalWellbeingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      emotionalWellbeingPage.shouldContainImportedFromText('OASys')
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
      emotionalWellbeingPage.shouldContainNavigation(path)
      emotionalWellbeingPage.shouldContainBackLink('#')
      emotionalWellbeingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      emotionalWellbeingPage.shouldContainShowReferralSubHeading()
      emotionalWellbeingPage.shouldContainRisksAndNeedsOasysMessage()
      emotionalWellbeingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      emotionalWellbeingPage.shouldContainNoPsychiatricDataSummaryCard()
    },
    showsHealthPageWithData: (role: ApplicationRole): void => {
      const health = healthFactory.build()
      sharedTests.referrals.beforeEach(role)

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
      healthPage.shouldContainNavigation(path)
      healthPage.shouldContainBackLink('#')
      healthPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      healthPage.shouldContainShowReferralSubHeading()
      healthPage.shouldContainRisksAndNeedsOasysMessage()
      healthPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      healthPage.shouldContainImportedFromText('OASys')
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
      healthPage.shouldContainNavigation(path)
      healthPage.shouldContainBackLink('#')
      healthPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      healthPage.shouldContainShowReferralSubHeading()
      healthPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      healthPage.shouldContainNoHealthDataSummaryCard()
    },
    showsLearningNeedsPageWithData: (role: ApplicationRole): void => {
      const learningNeeds = learningNeedsFactory.build({})
      sharedTests.referrals.beforeEach(role)

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
      learningNeedsPage.shouldContainNavigation(path)
      learningNeedsPage.shouldContainBackLink('#')
      learningNeedsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      learningNeedsPage.shouldContainShowReferralSubHeading()
      learningNeedsPage.shouldContainRisksAndNeedsOasysMessage()
      learningNeedsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      learningNeedsPage.shouldContainImportedFromText('OASys')
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
      learningNeedsPage.shouldContainNavigation(path)
      learningNeedsPage.shouldContainBackLink('#')
      learningNeedsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      learningNeedsPage.shouldContainShowReferralSubHeading()
      learningNeedsPage.shouldContainRisksAndNeedsOasysMessage()
      learningNeedsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      learningNeedsPage.shouldContainNoLearningNeedsDataSummaryCard()
    },
    showsLifestyleAndAssociatesPageWithData: (role: ApplicationRole): void => {
      const lifestyle = lifestyleFactory.build({})
      sharedTests.referrals.beforeEach(role)

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
      lifestyleAndAssociatesPage.shouldContainNavigation(path)
      lifestyleAndAssociatesPage.shouldContainBackLink('#')
      lifestyleAndAssociatesPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      lifestyleAndAssociatesPage.shouldContainShowReferralSubHeading()
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsOasysMessage()
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      lifestyleAndAssociatesPage.shouldContainImportedFromText('OASys')
      lifestyleAndAssociatesPage.shouldContainReoffendingSummaryList()
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
      lifestyleAndAssociatesPage.shouldContainNavigation(path)
      lifestyleAndAssociatesPage.shouldContainBackLink('#')
      lifestyleAndAssociatesPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      lifestyleAndAssociatesPage.shouldContainShowReferralSubHeading()
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsOasysMessage()
      lifestyleAndAssociatesPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      lifestyleAndAssociatesPage.shouldContainNoLifestyleDataSummaryCard()
    },
    showsOffenceAnalysisPageWithData: (role: ApplicationRole): void => {
      const offenceDetail = offenceDetailFactory.build({})
      sharedTests.referrals.beforeEach(role)

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
      offenceAnalysisPage.shouldContainNavigation(path)
      offenceAnalysisPage.shouldContainBackLink('#')
      offenceAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      offenceAnalysisPage.shouldContainShowReferralSubHeading()
      offenceAnalysisPage.shouldContainRisksAndNeedsOasysMessage()
      offenceAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      offenceAnalysisPage.shouldContainImportedFromText('OASys')
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
      offenceAnalysisPage.shouldContainNavigation(path)
      offenceAnalysisPage.shouldContainBackLink('#')
      offenceAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      offenceAnalysisPage.shouldContainShowReferralSubHeading()
      offenceAnalysisPage.shouldContainNoOffenceDetailsSummaryCard()
      offenceAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
    },
    showsRelationshipsPageWithData: (role: ApplicationRole): void => {
      const relationships = relationshipsFactory.build({})
      sharedTests.referrals.beforeEach(role)

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
      relationshipsPage.shouldContainNavigation(path)
      relationshipsPage.shouldContainBackLink('#')
      relationshipsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      relationshipsPage.shouldContainShowReferralSubHeading()
      relationshipsPage.shouldContainRisksAndNeedsOasysMessage()
      relationshipsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      relationshipsPage.shouldContainImportedFromText('OASys')
      relationshipsPage.shouldContainDomesticViolenceSummaryList()
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
      relationshipsPage.shouldContainNavigation(path)
      relationshipsPage.shouldContainBackLink('#')
      relationshipsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      relationshipsPage.shouldContainShowReferralSubHeading()
      relationshipsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      relationshipsPage.shouldContainNoRelationshipsSummaryCard()
    },
    showsRisksAndAlertsPageWithData: (role: ApplicationRole): void => {
      const risksAndAlerts = risksAndAlertsFactory.build({})
      sharedTests.referrals.beforeEach(role)

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
      risksAndAlertsPage.shouldContainNavigation(path)
      risksAndAlertsPage.shouldContainBackLink('#')
      risksAndAlertsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      risksAndAlertsPage.shouldContainShowReferralSubHeading()
      risksAndAlertsPage.shouldContainRisksAndNeedsOasysMessage()
      risksAndAlertsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      risksAndAlertsPage.shouldContainImportedFromText('OASys', 'imported-from-oasys-text')
      risksAndAlertsPage.shouldHaveOgrsInformation()
      risksAndAlertsPage.shouldHaveOvpInformation()
      risksAndAlertsPage.shouldHaveSaraInformation()
      risksAndAlertsPage.shouldHaveRsrInformation()
      risksAndAlertsPage.shouldHaveRoshInformation()
      risksAndAlertsPage.shouldContainImportedFromText('Nomis', 'imported-from-nomis-text')
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
      risksAndAlertsPage.shouldContainNavigation(path)
      risksAndAlertsPage.shouldContainBackLink('#')
      risksAndAlertsPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      risksAndAlertsPage.shouldContainShowReferralSubHeading()
      risksAndAlertsPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      risksAndAlertsPage.shouldContainNoRisksAndAlertsSummaryCard()
    },
    showsRoshAnalysisPageWithData: (role: ApplicationRole): void => {
      const roshAnalysis = roshAnalysisFactory.build({})
      sharedTests.referrals.beforeEach(role)

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
      roshAnalysisPage.shouldContainNavigation(path)
      roshAnalysisPage.shouldContainBackLink('#')
      roshAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      roshAnalysisPage.shouldContainShowReferralSubHeading()
      roshAnalysisPage.shouldContainRisksAndNeedsOasysMessage()
      roshAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      roshAnalysisPage.shouldContainImportedFromText('OASys')
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
      roshAnalysisPage.shouldContainNavigation(path)
      roshAnalysisPage.shouldContainBackLink('#')
      roshAnalysisPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      roshAnalysisPage.shouldContainShowReferralSubHeading()
      roshAnalysisPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      roshAnalysisPage.shouldContainNoRoshAnalysisSummaryCard()
    },
    showsThinkingAndBehavingPageWithData: (role: ApplicationRole): void => {
      const behaviour = behaviourFactory.build({})
      sharedTests.referrals.beforeEach(role)

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
      thinkingAndBehavingPage.shouldContainNavigation(path)
      thinkingAndBehavingPage.shouldContainBackLink('#')
      thinkingAndBehavingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      thinkingAndBehavingPage.shouldContainShowReferralSubHeading()
      thinkingAndBehavingPage.shouldContainRisksAndNeedsOasysMessage()
      thinkingAndBehavingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      thinkingAndBehavingPage.shouldContainImportedFromText('OASys')
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
      thinkingAndBehavingPage.shouldContainNavigation(path)
      thinkingAndBehavingPage.shouldContainBackLink('#')
      thinkingAndBehavingPage.shouldContainShowReferralSubNavigation(path, 'risksAndNeeds', referral.id)
      thinkingAndBehavingPage.shouldContainShowReferralSubHeading()
      thinkingAndBehavingPage.shouldContainRisksAndNeedsSideNavigation(path, referral.id)
      thinkingAndBehavingPage.shouldContainNoBehaviourDataSummaryCard()
    },
  },
}

export default sharedTests
