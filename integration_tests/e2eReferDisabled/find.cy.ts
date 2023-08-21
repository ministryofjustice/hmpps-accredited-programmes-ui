import { findPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import { CourseOfferingPage } from '../pages/find'
import Page from '../pages/page'

context('Find', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it("Doesn't show the 'Make a referral' button on an offering", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build({
      secondaryContactEmail: null,
    })
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)

    const path = findPaths.offerings.show({ courseOfferingId: courseOffering.id })
    cy.visit(path)

    const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, { course, courseOffering, organisation })
    courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
  })
})
