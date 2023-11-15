import type { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths, referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  offenderSentenceAndOffencesFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
  userFactory,
} from '../../server/testutils/factories'
import { CourseUtils, OrganisationUtils, StringUtils } from '../../server/utils'
import Page from '../pages/page'
import {
  AdditionalInformationPage,
  PersonalDetailsPage,
  ProgrammeHistoryPage,
  SentenceInformationPage,
} from '../pages/shared'
import type { Person, Referral } from '@accredited-programmes/models'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'
import type { Prisoner } from '@prisoner-search'

type ApplicationRole = `${ApplicationRoles}`

const course = courseFactory.build()
const coursePresenter = CourseUtils.presentCourse(course)
const courseOffering = courseOfferingFactory.build()
const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
let prisoner: Prisoner
const defaultPrisoner = prisonerFactory.build({
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
})
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
const organisation = OrganisationUtils.organisationFromPrison(prison)
const user = userFactory.build()
let courseParticipationPresenter1: CourseParticipationPresenter
let courseParticipationPresenter2: CourseParticipationPresenter

const pathsByRole = (role: ApplicationRole): typeof assessPaths | typeof referPaths => {
  return role === 'ROLE_ACP_PROGRAMME_TEAM' ? assessPaths : referPaths
}

const sharedTests = {
  referrals: {
    beforeEach: (role: ApplicationRole, data?: { person?: Person; prisoner?: Prisoner }): void => {
      prisoner = data?.prisoner || defaultPrisoner
      person = data?.person || defaultPerson
      referral = referralFactory.submitted().build({
        offeringId: courseOffering.id,
        prisonNumber: person.prisonNumber,
      })
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
      additionalInformationPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      additionalInformationPage.shouldContainSubmissionSummaryList(referral)
      additionalInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      additionalInformationPage.shouldContainAdditionalInformationSummaryCard()
      additionalInformationPage.shouldContainSubmittedText()
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
      programmeHistoryPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      programmeHistoryPage.shouldContainSubmissionSummaryList(referral)
      programmeHistoryPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      programmeHistoryPage.shouldContainNoHistorySummaryCard()
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
      personalDetailsPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      personalDetailsPage.shouldContainSubmissionSummaryList(referral)
      personalDetailsPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      personalDetailsPage.shouldContainImportedFromText()
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
      programmeHistoryPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      programmeHistoryPage.shouldContainSubmissionSummaryList(referral)
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
      sentenceInformationPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      sentenceInformationPage.shouldContainSubmissionSummaryList(referral)
      sentenceInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      sentenceInformationPage.shouldContainImportedFromText()
      sentenceInformationPage.shouldContainSentenceDetailsSummaryCard()
      sentenceInformationPage.shouldContainReleaseDatesSummaryCard()
    },

    showsSentenceInformationPageWithoutSentenceDetails: (role: ApplicationRole): void => {
      sharedTests.referrals.beforeEach(role, {
        person: { ...defaultPerson, sentenceStartDate: undefined },
        prisoner: { ...defaultPrisoner, sentenceStartDate: undefined },
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
      sentenceInformationPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      sentenceInformationPage.shouldContainSubmissionSummaryList(referral)
      sentenceInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      sentenceInformationPage.shouldContainImportedFromText()
      sentenceInformationPage.shouldContainNoSentenceDetailsSummaryCard()
      sentenceInformationPage.shouldContainReleaseDatesSummaryCard()
    },
  },
}

export default sharedTests
