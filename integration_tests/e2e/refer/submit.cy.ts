import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../../server/testutils/factories'
import { OrganisationUtils } from '../../../server/utils'
import auth from '../../mockApis/auth'
import Page from '../../pages/page'
import { CheckAnswersPage, CompletePage, TaskListPage } from '../../pages/refer'

context('Submitting a referral', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  it('Links to the check answers page when the referral is ready for submission', () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()

    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
    })
    const person = personFactory.build({
      currentPrison: prisoner.prisonName,
      name: 'Del Hatton',
      prisonNumber: prisoner.prisonerNumber,
    })

    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)

    const referral = referralFactory
      .submittable()
      .build({ oasysConfirmed: true, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.show({ referralId: referral.id })
    cy.visit(path)

    const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
    taskListPage.shouldBeReadyForSubmission()
  })

  it('Shows the correct information on the Check answers and submit task page', () => {
    cy.signIn()

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

    const referral = referralFactory
      .submittable()
      .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.checkAnswers({ referralId: referral.id })
    cy.visit(path)

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
      course,
      courseOffering,
      organisation,
      person,
      username: auth.mockedUsername(),
    })

    checkAnswersPage.shouldHavePersonDetails(person)
    checkAnswersPage.shouldContainNavigation(path)
    checkAnswersPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    checkAnswersPage.shouldHaveApplicationSummary()
    checkAnswersPage.shouldContainPersonSummaryList(person)
    checkAnswersPage.shouldHaveOasysConfirmation()
    checkAnswersPage.shouldHaveAdditionalInformation(referral)
    checkAnswersPage.shouldHaveConfirmationCheckbox()
    checkAnswersPage.shouldContainButton('Submit referral')
    checkAnswersPage.shouldContainButtonLink('Return to tasklist', referPaths.show({ referralId: referral.id }))
  })

  describe('When submitting a referral', () => {
    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()

    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
    })
    const person = personFactory.build({
      currentPrison: prisoner.prisonName,
      name: 'Del Hatton',
      prisonNumber: prisoner.prisonerNumber,
    })

    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)

    beforeEach(() => {
      cy.signIn()

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
    })

    it('redirects to the referral complete page when the user confirms the details', () => {
      const referral = referralFactory
        .submittable()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

      cy.task('stubReferral', referral)
      cy.task('stubUpdateReferralStatus', referral.id)

      const path = referPaths.checkAnswers({ referralId: referral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        person,
        username: auth.mockedUsername(),
      })
      checkAnswersPage.confirmDetailsAndSubmitReferral(referral)

      const completePage = Page.verifyOnPage(CompletePage)
      completePage.shouldContainPanel('Referral complete')
    })

    it('shows an error when the user tries to submit a referral without confirming the details', () => {
      const referral = referralFactory
        .submittable()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

      cy.task('stubReferral', referral)

      const path = referPaths.checkAnswers({ referralId: referral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        person,
        username: auth.mockedUsername(),
      })
      checkAnswersPage.shouldContainButton('Submit referral').click()

      const checkAnswersPageWithErrors = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        person,
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
    cy.signIn()

    const referral = referralFactory.submitted().build({ status: 'referral_submitted' })

    cy.task('stubReferral', referral)

    const path = referPaths.complete({ referralId: referral.id })
    cy.visit(path)

    const completePage = Page.verifyOnPage(CompletePage)
    completePage.shouldContainPanel('Referral complete')
  })
})
