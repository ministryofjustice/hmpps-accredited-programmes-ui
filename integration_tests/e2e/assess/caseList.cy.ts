import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { courseFactory, referralSummaryFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { Course, ReferralSummary } from '@accredited-programmes/models'

const createReferralSummaries = (courseName: Course['name']): Array<ReferralSummary> => [
  referralSummaryFactory.build({ courseName, prisonNumber: 'ABC123', status: 'assessment_started' }),
  referralSummaryFactory.build({ courseName, prisonNumber: 'ABC789', status: 'referral_started' }),
  referralSummaryFactory.build({ courseName, prisonNumber: 'ABC456', status: 'awaiting_assessment' }),
  referralSummaryFactory.build({ courseName, prisonNumber: 'ABC000', status: 'referral_submitted' }),
]

context('Referral case lists', () => {
  const limeCourse = courseFactory.build({ name: 'Lime Course' })
  const orangeCourse = courseFactory.build({ name: 'Blue Course' })
  const courses = [limeCourse, orangeCourse]
  const limeCourseReferralSummaries = createReferralSummaries(limeCourse.name)
  const orangeCourseReferralSummaries = createReferralSummaries(orangeCourse.name)

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
          prisonNumber: 'ABC123',
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
