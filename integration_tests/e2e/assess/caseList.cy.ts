import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { courseFactory, referralStatusRefDataFactory, referralViewFactory } from '../../../server/testutils/factories'
import FactoryHelpers from '../../../server/testutils/factories/factoryHelpers'
import { PathUtils } from '../../../server/utils'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { CaseListColumnHeader } from '@accredited-programmes/ui'

context('Referral case lists', () => {
  const limeCourse = courseFactory.build({ name: 'Lime Course' })
  const blueCourse = courseFactory.build({ name: 'Blue Course' })
  const courses = [limeCourse, blueCourse]
  const closedReferralStatuses = [
    referralStatusRefDataFactory.build({ closed: true, code: 'WITHDRAWN', draft: false }),
    referralStatusRefDataFactory.build({ closed: true, code: 'PROGRAMME_COMPLETE', draft: false }),
    referralStatusRefDataFactory.build({ closed: true, code: 'DESELECTED', draft: false }),
  ]
  const draftReferralStatuses = referralStatusRefDataFactory.buildList(3, { closed: false, draft: true })
  const openReferralStatuses = [
    referralStatusRefDataFactory.build({ closed: false, code: 'ASSESSMENT_STARTED', draft: false }),
    referralStatusRefDataFactory.build({ closed: false, code: 'AWAITING_ASSESSMENT', draft: false }),
    referralStatusRefDataFactory.build({ closed: false, code: 'REFERRAL_SUBMITTED', draft: false }),
  ]
  const referralStatuses = [...closedReferralStatuses, ...draftReferralStatuses, ...openReferralStatuses]

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
    cy.task('stubReferralStatuses', referralStatuses)
    cy.signIn()
  })

  describe('when viewing open referrals for a course', () => {
    const availableStatuses = ['ASSESSMENT_STARTED', 'AWAITING_ASSESSMENT', 'REFERRAL_SUBMITTED']

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

    beforeEach(() => {
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: limeCourse.name },
          statusGroup: { equalTo: 'open' },
        },
        referralViews: limeCourseReferralViews,
      })
    })

    it('shows the correct information', () => {
      const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders,
        course: limeCourse,
        referralViews: limeCourseReferralViews,
      })
      caseListPage.shouldContainCourseNavigation(path, courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainStatusNavigation('open', limeCourse.id)
      caseListPage.shouldContainTableOfReferralViews(assessPaths)
    })

    it('includes pagination', () => {
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          page: { equalTo: '3' },
          statusGroup: { equalTo: 'open' },
        },
        referralViews: limeCourseReferralViews,
        totalPages: 7,
      })
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          page: { equalTo: '4' },
          statusGroup: { equalTo: 'open' },
        },
        referralViews: limeCourseReferralViews,
        totalPages: 7,
      })

      const path = PathUtils.pathWithQuery(
        assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' }),
        [{ key: 'page', value: '4' }],
      )
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
        const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' })
        cy.visit(path)

        const caseListPage = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: limeCourseReferralViews,
        })
        caseListPage.shouldContainCourseNavigation(path, courses)
        caseListPage.shouldHaveSelectedFilterValues('', '')
        caseListPage.shouldContainStatusNavigation('open', limeCourse.id)
        caseListPage.shouldContainTableOfReferralViews(assessPaths)

        const programmeStrandSelectedValue = 'general offence'
        const referralStatusSelectedValue = 'ASSESSMENT_STARTED'
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
        caseListPage.shouldContainStatusNavigation('open', limeCourse.id)
        filteredCaseListPage.shouldContainTableOfReferralViews(assessPaths)

        filteredCaseListPage.shouldClearFilters()

        const clearedFilterListPage = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: limeCourseReferralViews,
        })
        clearedFilterListPage.shouldContainCourseNavigation(path, courses)
        clearedFilterListPage.shouldHaveSelectedFilterValues('', '')
        caseListPage.shouldContainStatusNavigation('open', limeCourse.id)
        clearedFilterListPage.shouldContainTableOfReferralViews(assessPaths)
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
        caseListPage.shouldContainCourseNavigation(
          assessPaths.caseList.show({ courseId: blueCourse.id, referralStatusGroup: 'open' }),
          courses,
        )
        caseListPage.shouldHaveSelectedFilterValues('', '')
        caseListPage.shouldContainStatusNavigation('open', blueCourse.id)
        caseListPage.shouldContainTableOfReferralViews(assessPaths)
      })
    })
  })

  describe('when viewing closed referrals for a course', () => {
    const availableStatuses = ['WITHDRAWN', 'PROGRAMME_COMPLETE', 'DESELECTED']

    const limeCourseReferralViews = FactoryHelpers.buildListWith(
      referralViewFactory,
      { courseName: limeCourse.name },
      { transient: { availableStatuses } },
      15,
    )

    beforeEach(() => {
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: limeCourse.name },
          statusGroup: { equalTo: 'closed' },
        },
        referralViews: limeCourseReferralViews,
      })
    })

    it('shows the correct information', () => {
      const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'closed' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders,
        course: limeCourse,
        referralViews: limeCourseReferralViews,
      })
      caseListPage.shouldContainCourseNavigation(path, courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainStatusNavigation('closed', limeCourse.id)
      caseListPage.shouldContainTableOfReferralViews(assessPaths)
    })
  })
})
