import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { courseFactory, referralViewFactory } from '../../../server/testutils/factories'
import FactoryHelpers from '../../../server/testutils/factories/factoryHelpers'
import { PathUtils } from '../../../server/utils'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { CaseListColumnHeader } from '@accredited-programmes/ui'

context('Referral case lists', () => {
  const limeCourse = courseFactory.build({ name: 'Lime Course' })
  const blueCourse = courseFactory.build({ name: 'Blue Course' })
  const courses = [limeCourse, blueCourse]
  const availableStatuses = ['assessment_started', 'awaiting_assessment', 'referral_submitted']
  const limeCourseReferralViews = FactoryHelpers.buildListWith(
    referralViewFactory,
    { courseName: limeCourse.name },
    { transient: { availableStatuses } },
    15,
  )
  const blueCourseReferralViews = FactoryHelpers.buildListWith(
    referralViewFactory,
    { courseName: blueCourse.name },
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
    cy.task('stubFindReferralViews', {
      organisationId: 'MRI',
      queryParameters: {
        courseName: { equalTo: limeCourse.name },
      },
      referralViews: limeCourseReferralViews,
    })
  })

  it('shows the correct information', () => {
    const path = assessPaths.caseList.show({ courseName: 'lime-course' })
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      columnHeaders,
      course: limeCourse,
      referralViews: limeCourseReferralViews,
    })
    caseListPage.shouldContainCourseNavigation(path, courses)
    caseListPage.shouldHaveSelectedFilterValues('', '')
    caseListPage.shouldContainTableOfReferralViews(assessPaths)
  })

  it('includes pagination', () => {
    cy.task('stubFindReferralViews', {
      organisationId: 'MRI',
      queryParameters: { page: { equalTo: '3' } },
      referralViews: limeCourseReferralViews,
      totalPages: 7,
    })
    cy.task('stubFindReferralViews', {
      organisationId: 'MRI',
      queryParameters: { page: { equalTo: '4' } },
      referralViews: limeCourseReferralViews,
      totalPages: 7,
    })

    const path = PathUtils.pathWithQuery(assessPaths.caseList.show({ courseName: 'lime-course' }), [
      { key: 'page', value: '4' },
    ])
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      columnHeaders,
      course: limeCourse,
      referralViews: limeCourseReferralViews,
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
        referralViews: limeCourseReferralViews,
      })
      caseListPage.shouldContainCourseNavigation(path, courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainTableOfReferralViews(assessPaths)

      const programmeStrandSelectedValue = 'general offence'
      const referralStatusSelectedValue = 'assessment started'
      const filteredReferralViews = [
        referralViewFactory.build({
          audience: 'General offence',
          courseName: limeCourse.name,
          status: 'assessment_started',
        }),
      ]

      caseListPage.shouldFilter(programmeStrandSelectedValue, referralStatusSelectedValue, filteredReferralViews)

      const filteredCaseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders,
        course: limeCourse,
        referralViews: filteredReferralViews,
      })
      filteredCaseListPage.shouldContainCourseNavigation(path, courses)
      filteredCaseListPage.shouldHaveSelectedFilterValues(programmeStrandSelectedValue, referralStatusSelectedValue)
      filteredCaseListPage.shouldContainTableOfReferralViews(assessPaths)
    })
  })

  describe('when visiting the index, without specifying a course', () => {
    it('redirects to the correct course case list page', () => {
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: blueCourse.name },
        },
        referralViews: blueCourseReferralViews,
      })

      const path = assessPaths.caseList.index({})
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders,
        course: blueCourse,
        referralViews: blueCourseReferralViews,
      })
      caseListPage.shouldContainCourseNavigation(assessPaths.caseList.show({ courseName: 'blue-course' }), courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainTableOfReferralViews(assessPaths)
    })
  })
})
