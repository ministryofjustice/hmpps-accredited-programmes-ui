import { findPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import { CourseOfferingPage } from '../pages/find'
import Page from '../pages/page'

context('Find', () => {
  it("Doesn't show the 'Make a referral' button on an offering", () => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build({
      secondaryContactEmail: null,
    })
    cy.task('stubOffering', { courseOffering })
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })

    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)
    cy.task('stubPrison', prison)

    const path = findPaths.offerings.show({ courseOfferingId: courseOffering.id })
    cy.visit(path)

    const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, { course, courseOffering, organisation })
    courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
  })
})
