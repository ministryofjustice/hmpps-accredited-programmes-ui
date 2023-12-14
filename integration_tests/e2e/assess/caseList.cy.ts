import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { courseFactory, referralSummaryFactory } from '../../../server/testutils/factories'
import FactoryHelpers from '../../../server/testutils/factories/factoryHelpers'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'

context('Referral case lists', () => {
  const limeCourse = courseFactory.build({ name: 'Lime Course' })
  const orangeCourse = courseFactory.build({ name: 'Blue Course' })
  const courses = [limeCourse, orangeCourse]
  const limeCourseReferralSummaries = FactoryHelpers.buildListWith(
    referralSummaryFactory,
    { courseName: limeCourse.name },
    15,
  )
  const orangeCourseReferralSummaries = FactoryHelpers.buildListWith(
    referralSummaryFactory,
    { courseName: orangeCourse.name },
    15,
  )

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.task('stubCoursesForOrganisation', { courses, organisationId: 'MRI' })
    cy.signIn()
    cy.task('stubFindReferralSummaries', {
      organisationId: 'MRI',
      queryParameters: {
        courseName: { equalTo: limeCourse.name },
      },
      referralSummaries: limeCourseReferralSummaries,
    })
  })

  it('shows the correct information', () => {
    const path = assessPaths.caseList.show({ courseName: 'lime-course' })
    // cy.task('log', `set the path as ${path}`)
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      course: limeCourse,
      referralSummaries: limeCourseReferralSummaries,
    })
    caseListPage.shouldContainCourseNavigation(path, courses)
    caseListPage.shouldHaveSelectedFilterValues('', '')
    caseListPage.shouldContainTableOfReferralSummaries()
  })

  describe('when using the filters', () => {
    it('shows the correct information', () => {
      const path = assessPaths.caseList.show({ courseName: 'lime-course' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        course: limeCourse,
        referralSummaries: limeCourseReferralSummaries,
      })
      caseListPage.shouldContainCourseNavigation(path, courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainTableOfReferralSummaries()

      const programmeStrandSelectedValue = 'general offence'
      const referralStatusSelectedValue = 'assessment started'
      const filteredReferralSummaries = [
        referralSummaryFactory.build({
          audiences: [programmeStrandSelectedValue],
          courseName: limeCourse.name,
          status: 'assessment_started',
        }),
      ]

      caseListPage.shouldFilter(programmeStrandSelectedValue, referralStatusSelectedValue, filteredReferralSummaries)

      const filteredCaseListPage = Page.verifyOnPage(CaseListPage, {
        course: limeCourse,
        referralSummaries: filteredReferralSummaries,
      })
      filteredCaseListPage.shouldContainCourseNavigation(path, courses)
      filteredCaseListPage.shouldHaveSelectedFilterValues(programmeStrandSelectedValue, referralStatusSelectedValue)
      filteredCaseListPage.shouldContainTableOfReferralSummaries()
    })
  })

  describe('when visiting the index, without specifying a course', () => {
    it('redirects to the correct course case list page', () => {
      cy.task('stubFindReferralSummaries', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: orangeCourse.name },
        },
        referralSummaries: orangeCourseReferralSummaries,
      })

      const path = assessPaths.caseList.index({})
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        course: orangeCourse,
        referralSummaries: orangeCourseReferralSummaries,
      })
      caseListPage.shouldContainCourseNavigation(assessPaths.caseList.show({ courseName: 'blue-course' }), courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainTableOfReferralSummaries()
    })
  })
})
