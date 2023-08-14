import { findPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { organisationUtils } from '../../server/utils'
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
    const organisation = organisationUtils.organisationFromPrison('an-ID', prison)

    cy.task('stubCourse', course)
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)

    const path = findPaths.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id })
    cy.visit(path)

    const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, { courseOffering, course, organisation })
    courseOfferingPage.shouldNotHaveMakeAReferralButton()
  })
})
