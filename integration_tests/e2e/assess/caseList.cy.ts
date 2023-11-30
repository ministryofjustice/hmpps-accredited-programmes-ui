import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { courseFactory, referralSummaryFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { ReferralSummary } from '@accredited-programmes/models'

context('Referral case lists', () => {
  const courseName = 'Lime Course'
  const course = courseFactory.build({ name: courseName })
  const courses = [course, courseFactory.build({ name: 'Orange Course' })]
  const referralSummaries: Array<ReferralSummary> = [
    referralSummaryFactory.build({ courseName, prisonNumber: 'ABC123', status: 'assessment_started' }),
    referralSummaryFactory.build({ courseName, prisonNumber: 'ABC789', status: 'referral_started' }),
    referralSummaryFactory.build({ courseName, prisonNumber: 'ABC456', status: 'awaiting_assessment' }),
    referralSummaryFactory.build({ courseName, prisonNumber: 'ABC000', status: 'referral_submitted' }),
  ]

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
        courseName: { equalTo: courseName },
      },
      referralSummaries,
    })
  })

  it('shows the correct information', () => {
    const path = assessPaths.caseList.show({ courseName: 'lime-course' })
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      course,
      referralSummaries,
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
        course,
        referralSummaries,
      })
      caseListPage.shouldContainCourseNavigation(path, courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainTableOfReferralSummaries()

      const programmeStrandSelectedValue = 'general offence'
      const referralStatusSelectedValue = 'assessment started'
      const filteredReferralSummaries = [
        referralSummaryFactory.build({
          audiences: ['General offence'],
          prisonNumber: 'ABC123',
          status: 'assessment_started',
        }),
      ]

      caseListPage.shouldFilter(programmeStrandSelectedValue, referralStatusSelectedValue, filteredReferralSummaries)

      const filteredCaseListPage = Page.verifyOnPage(CaseListPage, {
        course,
        referralSummaries: filteredReferralSummaries,
      })
      filteredCaseListPage.shouldContainCourseNavigation(path, courses)
      filteredCaseListPage.shouldHaveSelectedFilterValues(programmeStrandSelectedValue, referralStatusSelectedValue)
      filteredCaseListPage.shouldContainTableOfReferralSummaries()
    })
  })
})
