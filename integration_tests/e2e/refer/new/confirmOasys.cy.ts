import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../../../server/testutils/factories'
import { OrganisationUtils } from '../../../../server/utils'
import auth from '../../../mockApis/auth'
import Page from '../../../pages/page'
import { NewReferralConfirmOasysPage, NewReferralTaskListPage } from '../../../pages/refer'

context('OASys confirmation', () => {
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
  const referral = referralFactory.started().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: auth.mockedUser.username,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
  })

  it('Shows the confirm OASys form page', () => {
    cy.task('stubAssessmentDateInfo', {
      assessmentDateInfo: { hasOpenAssessment: true, recentCompletedAssessmentDate: '2023-12-19' },
      prisonNumber: person.prisonNumber,
    })

    const path = referPaths.new.confirmOasys.show({ referralId: referral.id })
    cy.visit(path)

    const confirmOasysPage = Page.verifyOnPage(NewReferralConfirmOasysPage, { person, referral })
    confirmOasysPage.shouldHavePersonDetails(person)
    confirmOasysPage.shouldContainBackLink(referPaths.new.show({ referralId: referral.id }))
    confirmOasysPage.shouldContainHomeLink()
    confirmOasysPage.shouldContainOasysInformationParagraph(
      'The latest approved layer 3 assessment for Del Hatton was completed on 19 December 2023. A newer assessment exists, but is incomplete, so will not be shown in the referral.',
    )
    confirmOasysPage.shouldContainConfirmationCheckbox()
    confirmOasysPage.shouldContainContinueButton()
  })

  describe('when there a completed assessment date but no open assessment', () => {
    it('displays the correct message', () => {
      cy.task('stubAssessmentDateInfo', {
        assessmentDateInfo: { hasOpenAssessment: false, recentCompletedAssessmentDate: '2023-12-19' },
        prisonNumber: person.prisonNumber,
      })

      const path = referPaths.new.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(NewReferralConfirmOasysPage, { person, referral })
      confirmOasysPage.shouldContainOasysInformationParagraph(
        'The latest approved layer 3 assessment for Del Hatton was completed on 19 December 2023.',
      )
    })
  })

  describe('when there is no assessment information', () => {
    it('displays the correct message', () => {
      cy.task('stubAssessmentDateInfo', {
        assessmentDateInfo: {},
        prisonNumber: person.prisonNumber,
      })

      const path = referPaths.new.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(NewReferralConfirmOasysPage, { person, referral })
      confirmOasysPage.shouldContainOasysInformationParagraph(
        'There is no completed and approved layer 3 assessment for Del Hatton.',
      )
    })
  })

  describe('When confirming OASys information', () => {
    it('updates the referral and redirects to the task list', () => {
      cy.task('stubUpdateReferral', referral.id)

      const course = courseFactory.build()
      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = OrganisationUtils.organisationFromPrison(prison)
      cy.task('stubPrison', prison)

      const path = referPaths.new.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(NewReferralConfirmOasysPage, { person, referral })
      confirmOasysPage.confirmOasys()

      const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
        course,
        courseOffering,
        organisation,
        referral,
      })
      taskListPage.shouldHaveConfirmedOasys()
    })

    it('displays an error when the checkbox is not checked', () => {
      const path = referPaths.new.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(NewReferralConfirmOasysPage, { person, referral })
      confirmOasysPage.shouldContainButton('Continue').click()

      const confirmOasysPageWithError = Page.verifyOnPage(NewReferralConfirmOasysPage, { person, referral })
      confirmOasysPageWithError.shouldHaveErrors([
        {
          field: 'oasysConfirmed',
          message: 'Tick the box to confirm the OASys information is up to date',
        },
      ])
    })
  })
})
