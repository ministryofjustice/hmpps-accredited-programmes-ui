import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { findPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import { CourseOfferingPage, CoursePage, CoursesPage } from '../pages/find'
import Page from '../pages/page'
import type { CourseOffering } from '@accredited-programmes/models'
import type { OrganisationWithOfferingId } from '@accredited-programmes/ui'

context('Find', () => {
  const courses = courseFactory.buildList(4)

  describe('For any user', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [] })
      cy.task('stubAuthUser')
      cy.signIn()
    })

    it('Shows a list of all courses sorted alphabetically', () => {
      cy.task('stubCourses', courses)

      const path = findPaths.index({})
      cy.visit(path)

      const coursesPage = Page.verifyOnPage(CoursesPage)
      coursesPage.shouldContainNavigation(path)

      const sortedCourses = [...courses].sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

      coursesPage.shouldHaveCourses(sortedCourses)
    })

    it('Shows a single course and its offerings', () => {
      cy.task('stubCourse', courses[0])

      const prisons = prisonFactory.buildList(3)
      const courseOfferings: Array<CourseOffering> = []
      const organisationsWithOfferingIds: Array<OrganisationWithOfferingId> = []

      prisons.forEach(prison => {
        const courseOffering = courseOfferingFactory.build({ organisationId: prison.prisonId })
        courseOfferings.push(courseOffering)

        organisationsWithOfferingIds.push({
          ...OrganisationUtils.organisationFromPrison(prison),
          courseOfferingId: courseOffering.id,
        })

        cy.task('stubPrison', prison)
      })
      cy.task('stubOfferingsByCourse', { courseId: courses[0].id, courseOfferings })

      const path = findPaths.show({ courseId: courses[0].id })
      cy.visit(path)

      const coursePage = Page.verifyOnPage(CoursePage, courses[0])
      coursePage.shouldContainNavigation(path)
      coursePage.shouldContainBackLink(findPaths.index({}))
      coursePage.shouldHaveCourse()
      coursePage.shouldHaveOrganisations(organisationsWithOfferingIds)
    })

    describe('Viewing a single offering', () => {
      it('shows a single offering with no secondary email address', () => {
        const courseOffering = courseOfferingFactory.build({
          secondaryContactEmail: null,
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
        courseOfferingPage.shouldContainNavigation(path)
        courseOfferingPage.shouldContainBackLink(findPaths.show({ courseId: courses[0].id }))
        courseOfferingPage.shouldContainAudienceTags(courseOfferingPage.course.audienceTags)
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
        courseOfferingPage.shouldContainNavigation(path)
        courseOfferingPage.shouldContainBackLink(findPaths.show({ courseId: courses[0].id }))
        courseOfferingPage.shouldContainAudienceTags(courseOfferingPage.course.audienceTags)
        courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
      })
    })
  })

  describe('For a user with the `ROLE_ACP_REFERRER` role', () => {
    const courseOffering = courseOfferingFactory.build()
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)
    const path = findPaths.offerings.show({ courseOfferingId: courseOffering.id })

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()

      cy.task('stubOffering', { courseOffering })
      cy.task('stubPrison', prison)
    })

    describe('and a referable course', () => {
      it('shows the "Make a referral" button on an offering', () => {
        const referableCourse = courseFactory.build({ referable: true })
        cy.task('stubCourseByOffering', { course: referableCourse, courseOfferingId: courseOffering.id })

        cy.visit(path)

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: referableCourse,
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldContainMakeAReferralButtonLink()
      })
    })

    describe('and a non-referable course', () => {
      it('does not show the "Make a referral" button on an offering', () => {
        const nonReferableCourse = courseFactory.build({ referable: false })
        cy.task('stubCourseByOffering', { course: nonReferableCourse, courseOfferingId: courseOffering.id })

        cy.visit(path)

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: nonReferableCourse,
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
      })
    })
  })
})
