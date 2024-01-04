import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { courseFactory, referralSummaryFactory } from '../../../server/testutils/factories'
import FactoryHelpers from '../../../server/testutils/factories/factoryHelpers'
import { PathUtils } from '../../../server/utils'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { CaseListColumnHeader } from '@accredited-programmes/ui'

context('Referral case lists', () => {
  const limeCourse = courseFactory.build({ name: 'Lime Course' })
  const orangeCourse = courseFactory.build({ name: 'Blue Course' })
  const courses = [limeCourse, orangeCourse]
  const availableStatuses = ['assessment_started', 'awaiting_assessment', 'referral_submitted']
  const limeCourseReferralSummaries = FactoryHelpers.buildListWith(
    referralSummaryFactory,
    { courseName: limeCourse.name },
    { transient: { availableStatuses } },
    15,
  )
  const orangeCourseReferralSummaries = FactoryHelpers.buildListWith(
    referralSummaryFactory,
    { courseName: orangeCourse.name },
    { transient: { availableStatuses } },
    15,
  )
  const columnHeaders: Array<CaseListColumnHeader> = [
    'Name / Prison number',
    'Conditional release date',
    'Parole eligibility date',
    'Tariff end date',
    'Programme strand',
    'Referral status',
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
        courseName: { equalTo: limeCourse.name },
      },
      referralSummaries: limeCourseReferralSummaries,
    })
  })

  it('shows the correct information', () => {
    const path = assessPaths.caseList.show({ courseName: 'lime-course' })
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      columnHeaders,
      course: limeCourse,
      referralSummaries: limeCourseReferralSummaries,
    })
    caseListPage.shouldContainCourseNavigation(path, courses)
    caseListPage.shouldHaveSelectedFilterValues('', '')
    caseListPage.shouldContainTableOfReferralSummaries()
  })

  it('includes pagination', () => {
    cy.task('stubFindReferralSummaries', {
      organisationId: 'MRI',
      queryParameters: { page: { equalTo: '3' } },
      referralSummaries: limeCourseReferralSummaries,
      totalPages: 7,
    })
    cy.task('stubFindReferralSummaries', {
      organisationId: 'MRI',
      queryParameters: { page: { equalTo: '4' } },
      referralSummaries: limeCourseReferralSummaries,
      totalPages: 7,
    })

    const path = PathUtils.pathWithQuery(assessPaths.caseList.show({ courseName: 'lime-course' }), [
      { key: 'page', value: '4' },
    ])
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      columnHeaders,
      course: limeCourse,
      referralSummaries: limeCourseReferralSummaries,
    })
    caseListPage.shouldContainPaginationPreviousButtonLink()
    caseListPage.shouldContainPaginationNextButtonLink()
    caseListPage.shouldContainPaginationItems(['1', '&ctdot;', '3', '4', '5', '&ctdot;', '7'])
    caseListPage.shouldBeOnPaginationPage(4)

    caseListPage.clickPaginationNextButton()
    caseListPage.shouldBeOnPaginationPage(5)
    caseListPage.clickPaginationPreviousButton()
    caseListPage.shouldBeOnPaginationPage(4)
    caseListPage.clickPaginationPage(5)
    caseListPage.shouldBeOnPaginationPage(5)
  })

  describe('when using the filters', () => {
    it('shows the correct information', () => {
      const path = assessPaths.caseList.show({ courseName: 'lime-course' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders,
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
        columnHeaders,
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
        columnHeaders,
        course: orangeCourse,
        referralSummaries: orangeCourseReferralSummaries,
      })
      caseListPage.shouldContainCourseNavigation(assessPaths.caseList.show({ courseName: 'blue-course' }), courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainTableOfReferralSummaries()
    })
  })
})
