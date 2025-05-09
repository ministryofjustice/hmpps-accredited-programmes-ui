import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  peopleSearchResponseFactory,
  personFactory,
  pniScoreFactory,
  prisonFactory,
  referralFactory,
} from '../../../../server/testutils/factories'
import { OrganisationUtils } from '../../../../server/utils'
import auth from '../../../mockApis/auth'
import Page from '../../../pages/page'
import { NewReferralAdditionalInformationPage, NewReferralTaskListPage } from '../../../pages/refer'

context('Additional information', () => {
  const courseOffering = courseOfferingFactory.build()
  const prisoner = peopleSearchResponseFactory.build({
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    name: 'Del Hatton',
    prisonNumber: prisoner.prisonerNumber,
  })
  const referral = referralFactory.started().build({
    additionalInformation: undefined,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerOverrideReason: undefined,
    referrerUsername: auth.mockedUser.username,
  })
  const programmePathway = 'MODERATE_INTENSITY'
  const course = courseFactory.build({ intensity: 'MODERATE' })
  const pniScore = pniScoreFactory.build({
    programmePathway,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubPni', { pniScore, prisonNumber: person.prisonNumber })
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
  })

  it('Shows the additional information form page', () => {
    const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
    cy.visit(path)

    const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
    additionalInformationPage.shouldHavePersonDetails(person)
    additionalInformationPage.shouldContainBackLink(referPaths.new.show({ referralId: referral.id }))
    additionalInformationPage.shouldContainHomeLink()
    additionalInformationPage.shouldContainInstructions()
    additionalInformationPage.shouldContainAdditionalInformationTextArea()
    additionalInformationPage.shouldContainContinueButton()
  })

  describe('When updating the additional information', () => {
    it('displays an error when too much information is provided', () => {
      const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const tooMuchInformation = 'a'.repeat(4001)

      const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
      additionalInformationPage.submitAdditionalInformation(tooMuchInformation)
      additionalInformationPage.shouldContainButton('Continue').click()

      const additionalInformationPageWithError = Page.verifyOnPage(NewReferralAdditionalInformationPage, {
        person,
        referral,
      })
      additionalInformationPageWithError.shouldHaveErrors([
        {
          field: 'additionalInformation',
          message: 'Additional information must be 4000 characters or fewer',
        },
      ])
      additionalInformationPageWithError.shouldContainEnteredAdditionalInformation(tooMuchInformation)
    })

    it('when skip is selected, updates the referral and redirects to the task list', () => {
      cy.task('stubUpdateReferral', referral.id)

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = OrganisationUtils.organisationFromPrison(prison)
      cy.task('stubPrison', prison)

      const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
      additionalInformationPage.skipAdditionalInformation()

      const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
        course,
        courseOffering,
        organisation,
        referral,
      })
      taskListPage.shouldHaveAdditionalInformation()
    })

    it('updates the referral and redirects to the task list', () => {
      cy.task('stubUpdateReferral', referral.id)

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = OrganisationUtils.organisationFromPrison(prison)
      cy.task('stubPrison', prison)

      const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
      additionalInformationPage.submitAdditionalInformation()

      const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
        course,
        courseOffering,
        organisation,
        referral,
      })
      taskListPage.shouldHaveAdditionalInformation()
    })
  })
})

context('Additional information with override', () => {
  const courseOffering = courseOfferingFactory.build()
  const prisoner = peopleSearchResponseFactory.build({
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    name: 'Del Hatton',
    prisonNumber: prisoner.prisonerNumber,
  })
  const referral = referralFactory.started().build({
    additionalInformation: undefined,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerOverrideReason: undefined,
    referrerUsername: auth.mockedUser.username,
  })
  const programmePathway = 'MODERATE_INTENSITY'
  const course = courseFactory.build({ intensity: 'HIGH' })
  const pniScore = pniScoreFactory.build({
    programmePathway,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubPni', { pniScore, prisonNumber: person.prisonNumber })
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
  })

  it('Shows the additional information form page with the override reason textarea', () => {
    const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
    cy.visit(path)

    const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
    additionalInformationPage.shouldHavePersonDetails(person)
    additionalInformationPage.shouldContainBackLink(referPaths.new.show({ referralId: referral.id }))
    additionalInformationPage.shouldContainHomeLink()
    additionalInformationPage.shouldContainInstructions()
    additionalInformationPage.shouldContainAdditionalInformationTextArea()
    additionalInformationPage.shouldContainOverrideReasonTextArea()
    additionalInformationPage.shouldContainContinueButton()
  })

  describe('When updating the additional information', () => {
    it('displays an error when too much information is provided', () => {
      const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const tooMuchInformation = 'a'.repeat(4001)

      const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
      additionalInformationPage.submitAdditionalInformation(tooMuchInformation)
      additionalInformationPage.shouldContainButton('Continue').click()

      const additionalInformationPageWithError = Page.verifyOnPage(NewReferralAdditionalInformationPage, {
        person,
        referral,
      })
      additionalInformationPageWithError.shouldHaveErrors([
        {
          field: 'additionalInformation',
          message: 'Additional information must be 4000 characters or fewer',
        },
      ])
      additionalInformationPageWithError.shouldContainEnteredAdditionalInformation(tooMuchInformation)
    })

    it('updates the referral and redirects to the task list', () => {
      cy.task('stubUpdateReferral', referral.id)

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = OrganisationUtils.organisationFromPrison(prison)
      cy.task('stubPrison', prison)

      const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
      additionalInformationPage.submitOverrideReason()

      const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
        course,
        courseOffering,
        organisation,
        referral,
      })
      taskListPage.shouldHaveAdditionalInformation()
    })
  })
})
