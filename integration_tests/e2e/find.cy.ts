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
      coursesPage.shouldContainHomeLink()

      const sortedCourses = [...courses].sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

      coursesPage.shouldHaveCourses(sortedCourses)
      coursesPage.shouldNotContainAddNewProgrammeLink()
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
      coursePage.shouldContainBackLink(findPaths.index({}))
      coursePage.shouldContainHomeLink()
      coursePage.shouldHaveCourse()
      coursePage.shouldContainOfferingsText()
      coursePage.shouldHaveOrganisations(organisationsWithOfferingIds)
    })

    describe('when there are no offerings for a course', () => {
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

    describe('Viewing a single offering', () => {
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

  describe('For a user with the `ROLE_ACP_EDITOR` role', () => {
    it('should show the "Add a new programme" button', () => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_EDITOR] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()
      cy.task('stubCourses', courses)

      const path = findPaths.index({})
      cy.visit(path)

      const coursesPage = Page.verifyOnPage(CoursesPage)
      coursesPage.shouldContainAddNewProgrammeLink()
    })
  })

  describe('For a user with the `ROLE_ACP_REFERRER` role', () => {
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
        it('shows the "Make a referral" button on an offering', () => {
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
          courseOfferingPage.shouldContainMakeAReferralButtonLink()
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
      })
    })
  })
})
