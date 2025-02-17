import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { findPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import AuthErrorPage from '../pages/authError'
import { CourseOfferingPage, CoursePage, CoursesPage } from '../pages/find'
import Page from '../pages/page'
import type { CourseOffering } from '@accredited-programmes/models'

context('Find', () => {
  const courses = courseFactory.buildList(4)

  describe('When the user has neither the `ROLE_ACP_EDITOR` or `ROLE_ACP_REFERRER` roles', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [] })
      cy.task('stubAuthUser')
      cy.signIn()
    })

    it('shows the auth error page for a course', () => {
      const path = findPaths.show({ courseId: courses[0].id })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })

    it('shows the auth error page for an offering', () => {
      const path = findPaths.offerings.show({ courseOfferingId: 'course-offering-id' })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })
  })

  describe('For a user with the `ROLE_ACP_EDITOR` role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_EDITOR] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()
    })

    describe('when viewing all programmes', () => {
      it('shows a list of all programmes along with an "Add a new programme" button', () => {
        cy.task('stubCourses', courses)

        const path = findPaths.index({})
        cy.visit(path)

        const sortedCourses = [...courses].sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

        const coursesPage = Page.verifyOnPage(CoursesPage)
        coursesPage.shouldContainHomeLink()
        coursesPage.shouldContainAddNewProgrammeLink()
        coursesPage.shouldHaveCourses(sortedCourses)
      })
    })

    describe('when viewing an individual programme', () => {
      it('shows the "Add a new location" and "Update programme" links', () => {
        cy.task('stubCourse', courses[0])

        const courseOfferings: Array<CourseOffering> = []

        cy.task('stubOfferingsByCourse', { courseId: courses[0].id, courseOfferings })

        const path = findPaths.show({ courseId: courses[0].id })
        cy.visit(path)

        const coursePage = Page.verifyOnPage(CoursePage, courses[0])
        coursePage.shouldContainUpdateProgrammeLink()
        coursePage.shouldContainAddCourseOfferingLink()
      })

      describe('when there are no offerings', () => {
        it('shows a message that there are no offerings', () => {
          cy.task('stubCourse', courses[0])

          cy.task('stubOfferingsByCourse', { courseId: courses[0].id, courseOfferings: [] })

          const path = findPaths.show({ courseId: courses[0].id })
          cy.visit(path)

          const coursePage = Page.verifyOnPage(CoursePage, courses[0])
          coursePage.shouldContainBackLink(findPaths.index({}))
          coursePage.shouldContainHomeLink()
          coursePage.shouldHaveCourse()
          coursePage.shouldContainNoOfferingsText()
        })
      })
    })

    describe('when viewing an individual offering', () => {
      it('shows contain update and delete buttons ', () => {
        const courseOffering = courseOfferingFactory.build({ referable: true })
        cy.task('stubOffering', { courseOffering })
        cy.task('stubCourseByOffering', { course: courses[0], courseOfferingId: courseOffering.id })

        const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
        const organisation = OrganisationUtils.organisationFromPrison(prison)
        cy.task('stubPrison', prison)

        const path = findPaths.offerings.show({ courseOfferingId: courseOffering.id })
        cy.visit(path)

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: courses[0],
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldContainUpdateCourseOfferingLink()
        courseOfferingPage.shouldContainDeleteOfferingButton()
      })

      it('shows a single offering with no secondary email address', () => {
        const courseOffering = courseOfferingFactory.build({
          secondaryContactEmail: undefined,
        })
        cy.task('stubOffering', { courseOffering })
        cy.task('stubCourseByOffering', { course: courses[0], courseOfferingId: courseOffering.id })

        const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
        const organisation = OrganisationUtils.organisationFromPrison(prison)
        cy.task('stubPrison', prison)

        const path = findPaths.offerings.show({ courseOfferingId: courseOffering.id })
        cy.visit(path)

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: courses[0],
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldContainBackLink(findPaths.show({ courseId: courses[0].id }))
        courseOfferingPage.shouldContainHomeLink()
        courseOfferingPage.shouldContainAudienceTag(courseOfferingPage.course.audienceTag)
        courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
        courseOfferingPage.shouldNotContainSecondaryContactEmailSummaryListItem()
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
      })

      it('shows a single offering with a secondary email address', () => {
        const courseOffering = courseOfferingFactory.build({
          secondaryContactEmail: 'secondary-contact@nowhere.com',
        })
        cy.task('stubOffering', { courseOffering })
        cy.task('stubCourseByOffering', { course: courses[0], courseOfferingId: courseOffering.id })

        const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
        const organisation = OrganisationUtils.organisationFromPrison(prison)
        cy.task('stubPrison', prison)

        const path = findPaths.offerings.show({ courseOfferingId: courseOffering.id })
        cy.visit(path)

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: courses[0],
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldContainBackLink(findPaths.show({ courseId: courses[0].id }))
        courseOfferingPage.shouldContainHomeLink()
        courseOfferingPage.shouldContainAudienceTag(courseOfferingPage.course.audienceTag)
        courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
      })
    })
  })

  describe('For a user with the `ROLE_ACP_REFERRER` role but not within the PNI Find journey', () => {
    const courseOfferingId = '00a718c8-6c3d-40b4-a6f0-728ff3bb71de'
    const organisationId = 'MMM'
    const course = courseFactory.build()
    const prison = prisonFactory.build({ prisonId: organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)
    const path = findPaths.offerings.show({ courseOfferingId })

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()

      cy.task('stubPrison', prison)
      cy.task('stubCourseByOffering', { course, courseOfferingId })
    })

    describe('and a referable course offering', () => {
      describe('and in an organisation where refer IS enabled', () => {
        it('does not show the "Make a referral" button on an offering', () => {
          const courseOffering = courseOfferingFactory.build({
            id: courseOfferingId,
            organisationEnabled: true,
            organisationId,
            referable: true,
          })
          cy.task('stubOffering', { courseOffering })

          cy.visit(path)

          const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
            course,
            courseOffering,
            organisation,
          })
          courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
          courseOfferingPage.shouldNotContainUpdateCourseOfferingLink()
          courseOfferingPage.shouldNotContainDeleteOfferingButton()
        })
      })

      describe('and in an organisation where refer IS NOT enabled', () => {
        it('does not show the "Make a referral" button on an offering', () => {
          const courseOffering = courseOfferingFactory.build({
            id: courseOfferingId,
            organisationEnabled: false,
            organisationId,
            referable: true,
          })
          cy.task('stubOffering', { courseOffering })

          cy.visit(path)

          const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
            course,
            courseOffering,
            organisation,
          })
          courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
          courseOfferingPage.shouldNotContainUpdateCourseOfferingLink()
          courseOfferingPage.shouldNotContainDeleteOfferingButton()
        })
      })
    })

    describe('and a non-referable course offering', () => {
      it('does not show the "Make a referral" button on an offering', () => {
        const nonReferableCourseOffering = courseOfferingFactory.build({
          id: courseOfferingId,
          organisationId,
          referable: false,
        })
        cy.task('stubOffering', { courseOffering: nonReferableCourseOffering })

        cy.visit(path)

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course,
          courseOffering: nonReferableCourseOffering,
          organisation,
        })
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
        courseOfferingPage.shouldNotContainUpdateCourseOfferingLink()
        courseOfferingPage.shouldNotContainDeleteOfferingButton()
      })
    })
  })
})
