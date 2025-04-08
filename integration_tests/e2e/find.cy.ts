import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { findPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import { CourseOfferingPage, CoursePage, CoursesPage, PersonSearchPage } from '../pages/find'
import Page from '../pages/page'
import type { CourseOffering } from '@accredited-programmes/models'

context('Find', () => {
  const courses = courseFactory.buildList(4)
  const targetCourse = courses[0]
  const sortedCourses = [...courses].sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

  const prison = prisonFactory.build()
  const organisation = OrganisationUtils.organisationFromPrison(prison)

  const referableCourseOffering = courseOfferingFactory.build({
    organisationEnabled: true,
    organisationId: organisation.id,
    referable: true,
  })

  describe('For a user without any roles used by our service', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()

      cy.task('stubCourses', courses)
      cy.task('stubCourse', targetCourse)
      cy.task('stubOfferingsByCourse', { courseId: targetCourse.id, courseOfferings: [referableCourseOffering] })
      cy.task('stubOffering', { courseOffering: referableCourseOffering })
      cy.task('stubCourseByOffering', { course: targetCourse, courseOfferingId: referableCourseOffering.id })
      cy.task('stubPrison', prison)
    })

    it('should allow the user to view all courses, individual courses and course offerings but not make a referral', () => {
      cy.visit(findPaths.pniFind.personSearch({}))

      const personSearchPage = Page.verifyOnPage(PersonSearchPage)
      personSearchPage.shouldContainLink('See a list of all programmes', findPaths.index({})).click()

      const coursesPage = Page.verifyOnPage(CoursesPage)
      coursesPage.shouldHaveCourses(sortedCourses)
      personSearchPage.shouldContainLink(targetCourse.name, findPaths.show({ courseId: targetCourse.id })).click()

      const coursePage = Page.verifyOnPage(CoursePage, targetCourse)
      coursePage
        .shouldContainLink(
          prison.prisonName,
          findPaths.offerings.show({ courseOfferingId: referableCourseOffering.id }),
        )
        .click()

      const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
        course: targetCourse,
        courseOffering: referableCourseOffering,
        organisation,
      })
      courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
    })
  })

  describe('For a user with the `ROLE_ACP_EDITOR` role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_EDITOR] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()

      cy.task('stubCourses', courses)
    })

    describe('when viewing all programmes', () => {
      it('shows a list of all programmes along with an "Add a new programme" button', () => {
        cy.visit(findPaths.index({}))

        const coursesPage = Page.verifyOnPage(CoursesPage)
        coursesPage.shouldContainHomeLink()
        coursesPage.shouldContainAddNewProgrammeLink()
        coursesPage.shouldHaveCourses(sortedCourses)
      })
    })

    describe('when viewing an individual programme', () => {
      beforeEach(() => {
        cy.task('stubCourse', targetCourse)
      })

      it('shows the "Add a new location" and "Update programme" links', () => {
        const courseOfferings: Array<CourseOffering> = []

        cy.task('stubOfferingsByCourse', { courseId: targetCourse.id, courseOfferings })

        cy.visit(findPaths.show({ courseId: targetCourse.id }))

        const coursePage = Page.verifyOnPage(CoursePage, targetCourse)
        coursePage.shouldContainUpdateProgrammeLink()
        coursePage.shouldContainAddCourseOfferingLink()
      })

      describe('when there are no offerings', () => {
        it('shows a message that there are no offerings', () => {
          cy.task('stubOfferingsByCourse', { courseId: targetCourse.id, courseOfferings: [] })

          cy.visit(findPaths.show({ courseId: targetCourse.id }))

          const coursePage = Page.verifyOnPage(CoursePage, targetCourse)
          coursePage.shouldContainBackLink(findPaths.index({}))
          coursePage.shouldContainHomeLink()
          coursePage.shouldHaveCourse()
          coursePage.shouldContainNoOfferingsText()
        })
      })
    })

    describe('when viewing an individual offering', () => {
      it('shows contain update and delete buttons ', () => {
        cy.task('stubOffering', { courseOffering: referableCourseOffering })
        cy.task('stubCourseByOffering', { course: targetCourse, courseOfferingId: referableCourseOffering.id })
        cy.task('stubPrison', prison)

        cy.visit(findPaths.offerings.show({ courseOfferingId: referableCourseOffering.id }))

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: targetCourse,
          courseOffering: referableCourseOffering,
          organisation,
        })
        courseOfferingPage.shouldContainUpdateCourseOfferingLink()
        courseOfferingPage.shouldContainDeleteOfferingButton()
      })

      it('shows a single offering with no secondary email address', () => {
        const courseOffering = {
          ...referableCourseOffering,
          secondaryContactEmail: undefined,
        }

        cy.task('stubOffering', { courseOffering })
        cy.task('stubCourseByOffering', { course: targetCourse, courseOfferingId: courseOffering.id })
        cy.task('stubPrison', prison)

        cy.visit(findPaths.offerings.show({ courseOfferingId: courseOffering.id }))

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: targetCourse,
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldContainBackLink(findPaths.show({ courseId: targetCourse.id }))
        courseOfferingPage.shouldContainHomeLink()
        courseOfferingPage.shouldContainAudienceTag(courseOfferingPage.course.audienceTag)
        courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
        courseOfferingPage.shouldNotContainSecondaryContactEmailSummaryListItem()
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
      })

      it('shows a single offering with a secondary email address', () => {
        const courseOffering = {
          ...referableCourseOffering,
          secondaryContactEmail: 'secondary-contact@nowhere.com',
        }

        cy.task('stubOffering', { courseOffering })
        cy.task('stubCourseByOffering', { course: targetCourse, courseOfferingId: courseOffering.id })
        cy.task('stubPrison', prison)

        cy.visit(findPaths.offerings.show({ courseOfferingId: courseOffering.id }))

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: targetCourse,
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldContainBackLink(findPaths.show({ courseId: targetCourse.id }))
        courseOfferingPage.shouldContainHomeLink()
        courseOfferingPage.shouldContainAudienceTag(courseOfferingPage.course.audienceTag)
        courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
      })
    })
  })

  describe('For a user with the `ROLE_ACP_REFERRER` role but not within the PNI Find journey', () => {
    const path = findPaths.offerings.show({ courseOfferingId: referableCourseOffering.id })

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()

      cy.task('stubPrison', prison)
      cy.task('stubCourseByOffering', { course: targetCourse, courseOfferingId: referableCourseOffering.id })
    })

    describe('and a referable course offering', () => {
      describe('and in an organisation where refer IS enabled', () => {
        it('does not show the "Make a referral" button on an offering', () => {
          cy.task('stubOffering', { courseOffering: referableCourseOffering })

          cy.visit(path)

          const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
            course: targetCourse,
            courseOffering: referableCourseOffering,
            organisation,
          })
          courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
          courseOfferingPage.shouldNotContainUpdateCourseOfferingLink()
          courseOfferingPage.shouldNotContainDeleteOfferingButton()
        })
      })

      describe('and in an organisation where refer IS NOT enabled', () => {
        it('does not show the "Make a referral" button on an offering', () => {
          const courseOffering = {
            ...referableCourseOffering,
            organisationEnabled: false,
          }

          cy.task('stubOffering', { courseOffering })

          cy.visit(path)

          const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
            course: targetCourse,
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
        const courseOffering = {
          ...referableCourseOffering,
          referable: false,
        }

        cy.task('stubOffering', { courseOffering })

        cy.visit(path)

        const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
          course: targetCourse,
          courseOffering,
          organisation,
        })
        courseOfferingPage.shouldNotContainMakeAReferralButtonLink()
        courseOfferingPage.shouldNotContainUpdateCourseOfferingLink()
        courseOfferingPage.shouldNotContainDeleteOfferingButton()
      })
    })
  })
})
