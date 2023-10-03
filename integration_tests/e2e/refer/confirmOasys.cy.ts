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
import Page from '../../pages/page'
import { ConfirmOasysPage, TaskListPage } from '../../pages/refer'

context('OASys confirmation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  it('Shows the confirm OASys form page', () => {
    cy.signIn()

    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
    })
    const person = personFactory.build({
      currentPrison: prisoner.prisonName,
      name: 'Del Hatton',
      prisonNumber: prisoner.prisonerNumber,
    })

    const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.confirmOasys.show({ referralId: referral.id })
    cy.visit(path)

    const confirmOasysPage = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
    confirmOasysPage.shouldHavePersonDetails(person)
    confirmOasysPage.shouldContainNavigation(path)
    confirmOasysPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    confirmOasysPage.shouldContainImportanceDetails()
    confirmOasysPage.shouldContainLastUpdatedNotificationBanner()
    confirmOasysPage.shouldContainConfirmationCheckbox()
    confirmOasysPage.shouldContainSaveAndContinueButton()
  })

  describe('When confirming OASys information', () => {
    it('updates the referral and redirects to the task list', () => {
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
      const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)

      const referral = referralFactory
        .started()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)
      cy.task('stubUpdateReferral', referral.id)

      const path = referPaths.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
      confirmOasysPage.confirmOasys()

      const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
      taskListPage.shouldHaveConfirmedOasys()
    })

    it('displays an error when the checkbox is not checked', () => {
      cy.signIn()

      const prisoner = prisonerFactory.build({
        firstName: 'Del',
        lastName: 'Hatton',
      })
      const person = personFactory.build({
        currentPrison: prisoner.prisonName,
        name: 'Del Hatton',
        prisonNumber: prisoner.prisonerNumber,
      })

      const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)

      const path = referPaths.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
      confirmOasysPage.shouldContainButton('Save and continue').click()

      const confirmOasysPageWithError = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
      confirmOasysPageWithError.shouldHaveErrors([
        {
          field: 'oasysConfirmed',
          message: 'Confirm the OASys information is up to date',
        },
      ])
    })
  })
})
