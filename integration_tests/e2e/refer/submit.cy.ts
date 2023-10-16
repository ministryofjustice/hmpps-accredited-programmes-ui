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
} from '../../../server/testutils/factories'
import { OrganisationUtils } from '../../../server/utils'
import auth from '../../mockApis/auth'
import Page from '../../pages/page'
import { CheckAnswersPage, CompletePage, TaskListPage } from '../../pages/refer'
import type { CourseParticipationWithName } from '@accredited-programmes/models'

context('Submitting a referral', () => {
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()
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
  const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
  const organisation = OrganisationUtils.organisationFromPrison(prison)
  const courseParticipations = [
    courseParticipationFactory.withCourseId().build({ courseId: course.id, createdAt: '2023-01-01T12:00:00.000Z' }),
    courseParticipationFactory
      .withOtherCourseName()
      .build({ createdAt: '2022-01-01T12:00:00.000Z', otherCourseName: 'A great course name' }),
  ]
  const courseParticipationsWithNames: Array<CourseParticipationWithName> = [
    { ...courseParticipations[0], name: course.name },
    {
      ...courseParticipations[1],
      name: courseParticipations[1].otherCourseName as CourseParticipationWithName['name'],
    },
  ]
  const submittableReferral = referralFactory
    .submittable()
    .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

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
  })

  it('Links to the check answers page when the referral is ready for submission', () => {
    cy.task('stubReferral', submittableReferral)

    const path = referPaths.show({ referralId: submittableReferral.id })
    cy.visit(path)

    const taskListPage = Page.verifyOnPage(TaskListPage, {
      course,
      courseOffering,
      organisation,
      referral: submittableReferral,
    })
    taskListPage.shouldBeReadyForSubmission()
  })

  describe('When checking answers', () => {
    const path = referPaths.checkAnswers({ referralId: submittableReferral.id })

    beforeEach(() => {
      cy.task('stubCourse', course)
      cy.task('stubReferral', submittableReferral)
    })

    it('Shows the information the user has submitted in the referral form', () => {
      cy.task('stubParticipationsByPerson', { courseParticipations, prisonNumber: prisoner.prisonerNumber })

      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsWithNames,
        person,
        referral: submittableReferral,
        username: auth.mockedUsername(),
      })
      checkAnswersPage.shouldHavePersonDetails(person)
      checkAnswersPage.shouldContainNavigation(path)
      checkAnswersPage.shouldContainBackLink(referPaths.show({ referralId: submittableReferral.id }))
      checkAnswersPage.shouldHaveApplicationSummary()
      checkAnswersPage.shouldContainPersonSummaryList(person)
      checkAnswersPage.shouldHaveProgrammeHistory()
      checkAnswersPage.shouldHaveOasysConfirmation()
      checkAnswersPage.shouldHaveAdditionalInformation(submittableReferral)
      checkAnswersPage.shouldHaveConfirmationCheckbox()
      checkAnswersPage.shouldContainButton('Submit referral')
      checkAnswersPage.shouldContainButtonLink(
        'Return to tasklist',
        referPaths.show({ referralId: submittableReferral.id }),
      )
    })

    describe('for a person with no programme history', () => {
      it('indicate that there is no programme history', () => {
        cy.task('stubParticipationsByPerson', { courseParticipations: [], prisonNumber: prisoner.prisonerNumber })

        cy.visit(path)

        const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
          course,
          courseOffering,
          organisation,
          participations: [],
          person,
          referral: submittableReferral,
          username: auth.mockedUsername(),
        })
        checkAnswersPage.shouldNotHaveProgrammeHistory()
      })
    })
  })

  describe('When submitting a referral', () => {
    beforeEach(() => {
      cy.task('stubCourse', course)
      cy.task('stubParticipationsByPerson', { courseParticipations, prisonNumber: prisoner.prisonerNumber })
    })

    it('redirects to the referral complete page when the user confirms the details', () => {
      cy.task('stubReferral', submittableReferral)
      cy.task('stubUpdateReferralStatus', submittableReferral.id)

      const path = referPaths.checkAnswers({ referralId: submittableReferral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsWithNames,
        person,
        referral: submittableReferral,
        username: auth.mockedUsername(),
      })
      checkAnswersPage.confirmDetailsAndSubmitReferral(submittableReferral)

      const completePage = Page.verifyOnPage(CompletePage)
      completePage.shouldContainPanel('Referral complete')
    })

    it('shows an error when the user tries to submit a referral without confirming the details', () => {
      cy.task('stubReferral', submittableReferral)

      const path = referPaths.checkAnswers({ referralId: submittableReferral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsWithNames,
        person,
        referral: submittableReferral,
        username: auth.mockedUsername(),
      })
      checkAnswersPage.shouldContainButton('Submit referral').click()

      const checkAnswersPageWithErrors = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        participations: courseParticipationsWithNames,
        person,
        referral: submittableReferral,
        username: auth.mockedUsername(),
      })
      checkAnswersPageWithErrors.shouldHaveErrors([
        {
          field: 'confirmation',
          message: 'Confirm that the information you have provided is complete, accurate and up to date',
        },
      ])
    })
  })

  it('Shows the complete page for a completed referral', () => {
    const submittedReferral = referralFactory.submitted().build({ status: 'referral_submitted' })
    cy.task('stubReferral', submittedReferral)

    const path = referPaths.complete({ referralId: submittedReferral.id })
    cy.visit(path)

    const completePage = Page.verifyOnPage(CompletePage)
    completePage.shouldContainPanel('Referral complete')
  })
})
