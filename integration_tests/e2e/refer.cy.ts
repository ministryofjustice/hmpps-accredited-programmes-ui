import { findPaths, referPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { organisationUtils } from '../../server/utils'
import Page from '../pages/page'
import ReferralStartPage from '../pages/refer/referralStart'

context('Refer', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Shows the start page for a referral', () => {
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

    const path = referPaths.start({ courseId: course.id, courseOfferingId: courseOffering.id })
    cy.visit(path)

    const referralStartPage = Page.verifyOnPage(ReferralStartPage, { course, organisation })
    referralStartPage.shouldContainNavigation(path)
    referralStartPage.shouldContainBackLink(
      findPaths.courses.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id }),
    )
    referralStartPage.shouldContainOrganisationAndCourseHeading(referralStartPage)
    referralStartPage.shouldHaveAudience(referralStartPage.course.audienceTags)
    referralStartPage.shouldHaveProcessInformation()
    referralStartPage.shouldHaveStartButton()
  })
})
