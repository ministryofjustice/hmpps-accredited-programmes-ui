import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { findPaths, referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  peopleSearchResponseFactory,
  personFactory,
  referralFactory,
  userFactory,
} from '../../../../server/testutils/factories'
import { StringUtils } from '../../../../server/utils'
import auth from '../../../mockApis/auth'
import Page from '../../../pages/page'
import {
  NewReferralCheckAnswersPage,
  NewReferralCompletePage,
  NewReferralDuplicatePage,
  NewReferralTaskListPage,
} from '../../../pages/refer'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'
import type { Organisation } from '@accredited-programmes-api'
import type { UserEmail } from '@manage-users-api'

context('Submitting a referral', () => {
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()
  const prisoner = peopleSearchResponseFactory.build({
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
  const organisation: Organisation = { code: courseOffering.organisationId, prisonName: 'HMP Test' }
  const addedByUser1 = userFactory.build({ name: 'Bobby Brown', username: auth.mockedUser.username })
  const addedByUser1Email: UserEmail = {
    email: 'referrer.user@email-test.co.uk',
    username: addedByUser1.username,
    verified: true,
  }
  const addedByUser2 = userFactory.build()
  const courseParticipationWithKnownCourseName = courseParticipationFactory.build({
    addedBy: addedByUser1.username,
    courseName: course.name,
    prisonNumber: person.prisonNumber,
  })
  const courseParticipationWithKnownCourseNamePresenter: CourseParticipationPresenter = {
    ...courseParticipationWithKnownCourseName,
    addedByDisplayName: StringUtils.convertToTitleCase(addedByUser1.name),
  }
  const courseParticipationWithUnknownCourseName = courseParticipationFactory.build({
    addedBy: addedByUser2.username,
    courseName: 'An course not in our system',
    prisonNumber: person.prisonNumber,
  })
  const courseParticipationWithUnknownCourseNamePresenter: CourseParticipationPresenter = {
    ...courseParticipationWithUnknownCourseName,
    addedByDisplayName: StringUtils.convertToTitleCase(addedByUser2.name),
  }
  const courseParticipations = [courseParticipationWithKnownCourseName, courseParticipationWithUnknownCourseName]
  const courseParticipationsPresenter: Array<CourseParticipationPresenter> = [
    courseParticipationWithKnownCourseNamePresenter,
    courseParticipationWithUnknownCourseNamePresenter,
  ]
  const submittableReferral = referralFactory.submittable().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: addedByUser1.username,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubOrganisation', organisation)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubUserDetails', addedByUser1)
    cy.task('stubUserDetails', addedByUser2)
    cy.task('stubUserEmail', addedByUser1Email)
  })

  it('Links to the check answers page when the referral is ready for submission', () => {
    cy.task('stubReferral', submittableReferral)

    const path = referPaths.new.show({ referralId: submittableReferral.id })
    cy.visit(path)

    const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
      course,
      courseOffering,
      organisation,
      referral: submittableReferral,
    })
    taskListPage.shouldBeReadyForSubmission()
  })

  describe('When checking answers', () => {
    const path = referPaths.new.checkAnswers({ referralId: submittableReferral.id })

    beforeEach(() => {
      cy.task('stubCourse', course)
      cy.task('stubReferral', submittableReferral)
    })

    it('Shows the information the user has submitted in the referral form', () => {
      cy.task('stubParticipationsByReferral', { courseParticipations, referralId: submittableReferral.id })

      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(NewReferralCheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsPresenter,
        person,
        referral: submittableReferral,
        referrerEmail: addedByUser1Email.email,
        referrerName: addedByUser1.name,
      })
      checkAnswersPage.shouldHavePersonDetails(person)
      checkAnswersPage.shouldContainBackLink(referPaths.new.show({ referralId: submittableReferral.id }))
      checkAnswersPage.shouldContainHomeLink()
      checkAnswersPage.shouldHaveCourseOfferingSummary()
      checkAnswersPage.shouldHaveReferrerSummary()
      checkAnswersPage.shouldContainPersonSummaryList(person)
      checkAnswersPage.shouldHaveProgrammeHistory()
      checkAnswersPage.shouldHaveOasysConfirmation()
      checkAnswersPage.shouldHaveAdditionalInformation()
      checkAnswersPage.shouldHaveConfirmationCheckbox()
      checkAnswersPage.shouldContainButton('Submit referral')
      checkAnswersPage.shouldContainButtonLink(
        'Return to tasklist',
        referPaths.new.show({ referralId: submittableReferral.id }),
      )
    })

    describe('for a person with no programme history', () => {
      it('indicates that there is no programme history', () => {
        cy.task('stubParticipationsByReferral', { courseParticipations: [], referralId: submittableReferral.id })

        cy.visit(path)

        const checkAnswersPage = Page.verifyOnPage(NewReferralCheckAnswersPage, {
          course,
          courseOffering,
          organisation,
          participations: [],
          person,
          referral: submittableReferral,
          referrerEmail: addedByUser1Email.email,
          referrerName: addedByUser1.name,
        })
        checkAnswersPage.shouldNotHaveProgrammeHistory()
      })
    })
  })

  describe('When submitting a referral', () => {
    beforeEach(() => {
      cy.task('stubCourse', course)
      cy.task('stubParticipationsByReferral', { courseParticipations, referralId: submittableReferral.id })
    })

    it('redirects to the referral complete page when the user confirms the details', () => {
      cy.task('stubReferral', submittableReferral)
      cy.task('stubSubmitReferral', { body: submittableReferral, referralId: submittableReferral.id })

      const path = referPaths.new.checkAnswers({ referralId: submittableReferral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(NewReferralCheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsPresenter,
        person,
        referral: submittableReferral,
        referrerEmail: addedByUser1Email.email,
        referrerName: addedByUser1.name,
      })
      checkAnswersPage.confirmDetailsAndSubmitReferral()

      const completePage = Page.verifyOnPage(NewReferralCompletePage)
      completePage.shouldContainPanel('Referral complete')
    })

    it('shows an error when the user tries to submit a referral without confirming the details', () => {
      cy.task('stubReferral', submittableReferral)

      const path = referPaths.new.checkAnswers({ referralId: submittableReferral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(NewReferralCheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsPresenter,
        person,
        referral: submittableReferral,
        referrerEmail: addedByUser1Email.email,
        referrerName: addedByUser1.name,
      })
      checkAnswersPage.shouldContainButton('Submit referral').click()

      const checkAnswersPageWithErrors = Page.verifyOnPage(NewReferralCheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsPresenter,
        person,
        referral: submittableReferral,
        referrerEmail: addedByUser1Email.email,
        referrerName: addedByUser1.name,
      })
      checkAnswersPageWithErrors.shouldHaveErrors([
        {
          field: 'confirmation',
          message: 'Tick the box to confirm the information you have provided is correct',
        },
      ])
    })

    describe('When there is a duplicate referral', () => {
      it('redirects to the duplicate referral page', () => {
        const duplicateReferral = referralFactory.submitted().build({
          offeringId: courseOffering.id,
          prisonNumber: person.prisonNumber,
          referrerUsername: addedByUser1.username,
        })

        cy.task('stubReferral', submittableReferral)
        cy.task('stubReferral', duplicateReferral)
        cy.task('stubSubmitReferral', { body: duplicateReferral, referralId: submittableReferral.id, status: 409 })
        cy.task('stubStatusTransitions', {
          referralId: duplicateReferral.id,
          statusTransitions: [],
        })

        const path = referPaths.new.checkAnswers({ referralId: submittableReferral.id })
        cy.visit(path)

        const checkAnswersPage = Page.verifyOnPage(NewReferralCheckAnswersPage, {
          course,
          courseOffering,
          organisation,
          participations: courseParticipationsPresenter,
          person,
          referral: submittableReferral,
          referrerEmail: addedByUser1Email.email,
          referrerName: addedByUser1.name,
        })
        checkAnswersPage.confirmDetailsAndSubmitReferral()

        const duplicatePage = Page.verifyOnPage(NewReferralDuplicatePage, {
          course,
          courseOffering,
          organisation,
          person,
          referral: duplicateReferral,
        })
        duplicatePage.shouldContainBackLink(
          referPaths.new.people.show({ courseOfferingId: courseOffering.id, prisonNumber: person.prisonNumber }),
        )
        duplicatePage.shouldContainReferralExistsText()
        duplicatePage.shouldContainCourseOfferingSummaryList()
        duplicatePage.shouldContainSubmissionSummaryList('Bobby Brown', 'referrer.user@email-test.co.uk')
        duplicatePage.shouldContainWarningText('You cannot create this referral while a duplicate referral is open.')
        duplicatePage.shouldContainButtonLink('Return to programme list', findPaths.pniFind.recommendedProgrammes({}))
      })
    })
  })

  it('Shows the complete page for a completed referral', () => {
    const submittedReferral = referralFactory.submitted().build({ referrerUsername: auth.mockedUser.username })
    cy.task('stubReferral', submittedReferral)

    const path = referPaths.new.complete({ referralId: submittedReferral.id })
    cy.visit(path)

    const completePage = Page.verifyOnPage(NewReferralCompletePage)
    completePage.shouldContainPanel('Referral complete')
    completePage.shouldHaveProcessInformation()
    completePage.shouldContainFeedbackLink()
    completePage.shouldContainMyReferralsLink()
  })
})
