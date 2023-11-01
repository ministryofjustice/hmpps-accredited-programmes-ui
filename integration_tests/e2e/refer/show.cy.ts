import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
  sentenceAndOffenceDetailsFactory,
  userFactory,
} from '../../../server/testutils/factories'
import { CourseUtils, OrganisationUtils, StringUtils } from '../../../server/utils'
import Page from '../../pages/page'
import {
  AdditionalInformationPage,
  PersonalDetailsPage,
  ProgrammeHistoryPage,
  SentenceInformationPage,
} from '../../pages/refer'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'

context('Viewing a submitted referral', () => {
  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const courseOffering = courseOfferingFactory.build()
  const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
  const prisoner = prisonerFactory.build({
    dateOfBirth: '1980-01-01',
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    dateOfBirth: '1 January 1980',
    ethnicity: prisoner.ethnicity,
    gender: prisoner.gender,
    name: 'Del Hatton',
    prisonNumber: prisoner.prisonerNumber,
    religionOrBelief: prisoner.religion,
    setting: 'Custody',
  })
  const referral = referralFactory.submitted().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
  })
  const organisation = OrganisationUtils.organisationFromPrison(prison)

  const user = userFactory.build()
  const courseParticipationPresenter1 = {
    ...courseParticipationFactory.build({
      addedBy: user.username,
      courseName: course.name,
      prisonNumber: person.prisonNumber,
    }),
    addedByDisplayName: StringUtils.convertToTitleCase(user.name),
  }
  const courseParticipationPresenter2 = {
    ...courseParticipationFactory.build({
      addedBy: user.username,
      courseName: 'Another course name',
      prisonNumber: person.prisonNumber,
    }),
    addedByDisplayName: StringUtils.convertToTitleCase(user.name),
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
  })

  describe('When reviewing personal details', () => {
    it('shows the correct information', () => {
      const path = referPaths.show.personalDetails({ referralId: referral.id })
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
    })
  })

  describe('When reviewing programme history', () => {
    beforeEach(() => {
      cy.task('stubUserDetails', user)
    })

    describe('and there are CourseParticipation records for that user', () => {
      it('shows the correct information, including the CourseParticipation records', () => {
        cy.task('stubParticipationsByPerson', {
          courseParticipations: [courseParticipationPresenter1, courseParticipationPresenter2],
          prisonNumber: prisoner.prisonerNumber,
        })

        const path = referPaths.show.programmeHistory({ referralId: referral.id })
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
        programmeHistoryPage.shouldContainHistorySummaryCards(courseParticipationsPresenter, referral.id, {
          change: false,
          remove: false,
        })
      })
    })

    describe('and there are no CourseParticipation records for that user', () => {
      it('shows the correct information, including a message that there are no CourseParticipation records', () => {
        cy.task('stubParticipationsByPerson', {
          courseParticipations: [],
          prisonNumber: prisoner.prisonerNumber,
        })

        const path = referPaths.show.programmeHistory({ referralId: referral.id })
        cy.visit(path)

        const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
          course,
          person,
        })

        programmeHistoryPage.shouldHavePersonDetails(person)
        programmeHistoryPage.shouldContainNavigation(path)
        programmeHistoryPage.shouldContainBackLink('#')
        programmeHistoryPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
        programmeHistoryPage.shouldContainNoHistoryParagraph()
      })
    })
  })

  describe('When reviewing sentence information', () => {
    it('shows the correct information', () => {
      const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()
      cy.task('stubSentenceAndOffenceDetails', { bookingId: prisoner.bookingId, sentenceAndOffenceDetails })

      const path = referPaths.show.sentenceInformation({ referralId: referral.id })
      cy.visit(path)

      const sentenceInformationPage = Page.verifyOnPage(SentenceInformationPage, {
        course,
        sentenceAndOffenceDetails,
      })
      sentenceInformationPage.shouldHavePersonDetails(person)
      sentenceInformationPage.shouldContainNavigation(path)
      sentenceInformationPage.shouldContainBackLink('#')
      sentenceInformationPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      sentenceInformationPage.shouldContainSubmissionSummaryList(referral)
      sentenceInformationPage.shouldContainSubmittedReferralSideNavigation(path, referral.id)
      sentenceInformationPage.shouldContainImportedFromText()
      sentenceInformationPage.shouldContainSentenceDetailsSummaryCard()
    })
  })

  describe('when reviewing additional information', () => {
    it('shows the correct information', () => {
      const path = referPaths.show.additionalInformation({ referralId: referral.id })
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
      additionalInformationPage.shouldContainAdditionalInformation()
      additionalInformationPage.shouldContainSubmittedText()
    })
  })
})
