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
    'Name and prison number',
    'Location',
    'Earliest release date',
    'Sentence type',
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

  const availableOpenStatuses = ['ASSESSMENT_STARTED', 'AWAITING_ASSESSMENT', 'REFERRAL_SUBMITTED']
  const availableClosedStatuses = ['WITHDRAWN', 'PROGRAMME_COMPLETE', 'DESELECTED']

  const limeCourseOpenReferralViews = FactoryHelpers.buildListWith(
    referralViewFactory,
    { courseName: limeCourse.name },
    { transient: { availableStatuses: availableOpenStatuses } },
    15,
  )
  const limeCourseClosedReferralViews = FactoryHelpers.buildListWith(
    referralViewFactory,
    { courseName: limeCourse.name },
    { transient: { availableStatuses: availableClosedStatuses } },
    5,
  )
  const blueCourseReferralViews = FactoryHelpers.buildListWith(
    referralViewFactory,
    { courseName: blueCourse.name },
    { transient: { availableStatuses: availableOpenStatuses } },
    15,
  )

  describe('when viewing open referrals for a course', () => {
    beforeEach(() => {
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: limeCourse.name },
          statusGroup: { equalTo: 'open' },
        },
        referralViews: limeCourseOpenReferralViews,
        totalElements: limeCourseOpenReferralViews.length,
      })
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: limeCourse.name },
          statusGroup: { equalTo: 'closed' },
        },
        referralViews: limeCourseClosedReferralViews,
        totalElements: limeCourseClosedReferralViews.length,
      })
    })

    it('shows the correct information', () => {
      const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders,
        course: limeCourse,
        referralViews: limeCourseOpenReferralViews,
      })
      caseListPage.shouldContainCourseNavigation(path, courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainStatusNavigation('open', limeCourse.id, {
        closed: limeCourseClosedReferralViews.length,
        open: limeCourseOpenReferralViews.length,
      })
      caseListPage.shouldContainTableOfReferralViews(assessPaths)
    })

    describe('when there are no referrals', () => {
      it('does not show the table or filters ', () => {
        cy.task('stubFindReferralViews', {
          organisationId: 'MRI',
          referralViews: [],
          statusGroup: { equalTo: 'open' },
          totalElements: 0,
        })
        cy.task('stubFindReferralViews', {
          organisationId: 'MRI',
          referralViews: [],
          statusGroup: { equalTo: 'closed' },
          totalElements: 0,
        })

        const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' })
        cy.visit(path)

        const caseListPage = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: [],
        })
        caseListPage.shouldContainCourseNavigation(path, courses)
        caseListPage.shouldNotContainFilters()
        caseListPage.shouldNotContainTable()
        caseListPage.shouldNotContainPagination()
        caseListPage.shouldContainText('You have no open referrals.')
      })
    })

    describe('when using the filters', () => {
      it('shows an error if applied with no selections', () => {
        const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' })
        cy.visit(path)

        const caseListPage = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: limeCourseOpenReferralViews,
        })
        caseListPage.shouldContainCourseNavigation(path, courses)
        caseListPage.shouldHaveSelectedFilterValues('', '')
        caseListPage.shouldContainStatusNavigation('open', limeCourse.id, {
          closed: limeCourseClosedReferralViews.length,
          open: limeCourseOpenReferralViews.length,
        })
        caseListPage.shouldContainTableOfReferralViews(assessPaths)

        caseListPage.shouldFilterButtonClick()

        const caseListPageWithError = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: limeCourseOpenReferralViews,
        })
        caseListPageWithError.shouldHaveErrors([
          {
            field: 'audience',
            message: 'Choose a filter',
          },
          {
            field: 'nameOrId',
            message: 'Enter a name or prison number',
          },
        ])
      })

      it('shows the correct information', () => {
        const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' })
        cy.visit(path)

        const caseListPage = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: limeCourseOpenReferralViews,
        })
        caseListPage.shouldContainCourseNavigation(path, courses)
        caseListPage.shouldHaveSelectedFilterValues('', '')
        caseListPage.shouldContainStatusNavigation('open', limeCourse.id, {
          closed: limeCourseClosedReferralViews.length,
          open: limeCourseOpenReferralViews.length,
        })
        caseListPage.shouldContainTableOfReferralViews(assessPaths)

        const programmeStrandSelectedValue = 'general offence'
        const referralStatusSelectedValue = 'ASSESSMENT_STARTED'
        const filteredOpenReferralViews = [
          referralViewFactory.build({
            audience: 'General offence',
            courseName: limeCourse.name,
            status: 'assessment_started',
          }),
        ]

        caseListPage.shouldFilter(
          programmeStrandSelectedValue,
          referralStatusSelectedValue,
          filteredOpenReferralViews,
          [],
        )

        const filteredCaseListPage = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: filteredOpenReferralViews,
        })
        filteredCaseListPage.shouldContainCourseNavigation(path, courses)
        filteredCaseListPage.shouldHaveSelectedFilterValues(programmeStrandSelectedValue, referralStatusSelectedValue)
        caseListPage.shouldContainStatusNavigation(
          'open',
          limeCourse.id,
          {
            closed: 0,
            open: filteredOpenReferralViews.length,
          },
          [
            { key: 'strand', value: 'general offence' },
            { key: 'status', value: 'ASSESSMENT_STARTED' },
          ],
        )
        filteredCaseListPage.shouldContainTableOfReferralViews(assessPaths)

        filteredCaseListPage.shouldClearFilters()

        const clearedFilterListPage = Page.verifyOnPage(CaseListPage, {
          columnHeaders,
          course: limeCourse,
          referralViews: limeCourseOpenReferralViews,
        })
        clearedFilterListPage.shouldContainCourseNavigation(path, courses)
        clearedFilterListPage.shouldHaveSelectedFilterValues('', '')
        caseListPage.shouldContainStatusNavigation('open', limeCourse.id, {
          closed: limeCourseClosedReferralViews.length,
          open: limeCourseOpenReferralViews.length,
        })
        clearedFilterListPage.shouldContainTableOfReferralViews(assessPaths)
      })

      describe('and there are no referrals for the applied filters', () => {
        it('does not show the table and displays a message ', () => {
          cy.task('stubFindReferralViews', {
            organisationId: 'MRI',
            referralViews: [],
            statusGroup: { equalTo: 'open' },
            totalElements: 0,
          })
          cy.task('stubFindReferralViews', {
            organisationId: 'MRI',
            referralViews: [],
            statusGroup: { equalTo: 'closed' },
            totalElements: 0,
          })

          const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'open' })
          cy.visit(`${path}?strand=general+offence`)

          const programmeStrandSelectedValue = 'general offence'

          const caseListPage = Page.verifyOnPage(CaseListPage, {
            columnHeaders,
            course: limeCourse,
            referralViews: [],
          })
          caseListPage.shouldContainCourseNavigation(path, courses)
          caseListPage.shouldHaveSelectedFilterValues(programmeStrandSelectedValue, '')
          caseListPage.shouldNotContainTable()
          caseListPage.shouldNotContainPagination()
          caseListPage.shouldContainText(
            'No results found in open referrals. Clear the filters or try a different filter.',
          )
        })
      })
    })

    it('includes pagination', () => {
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          page: { equalTo: '3' },
          statusGroup: { equalTo: 'open' },
        },
        referralViews: limeCourseOpenReferralViews,
        totalPages: 7,
      })
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          page: { equalTo: '4' },
          statusGroup: { equalTo: 'open' },
        },
        referralViews: limeCourseOpenReferralViews,
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
        referralViews: limeCourseOpenReferralViews,
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

    describe('when visiting the index, without specifying a course', () => {
      it('redirects to the correct course case list page', () => {
        cy.task('stubFindReferralViews', {
          organisationId: 'MRI',
          queryParameters: {
            courseName: { equalTo: blueCourse.name },
            statusGroup: { equalTo: 'open' },
          },
          referralViews: blueCourseReferralViews,
          totalElements: blueCourseReferralViews.length,
        })
        cy.task('stubFindReferralViews', {
          organisationId: 'MRI',
          queryParameters: {
            courseName: { equalTo: blueCourse.name },
            statusGroup: { equalTo: 'closed' },
          },
          referralViews: [],
          totalElements: 0,
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
        caseListPage.shouldContainStatusNavigation('open', blueCourse.id, {
          closed: 0,
          open: blueCourseReferralViews.length,
        })
        caseListPage.shouldContainTableOfReferralViews(assessPaths)
      })
    })
  })

  describe('when viewing closed referrals for a course', () => {
    beforeEach(() => {
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: limeCourse.name },
          statusGroup: { equalTo: 'open' },
        },
        referralViews: limeCourseOpenReferralViews,
        totalElements: limeCourseOpenReferralViews.length,
      })
      cy.task('stubFindReferralViews', {
        organisationId: 'MRI',
        queryParameters: {
          courseName: { equalTo: limeCourse.name },
          statusGroup: { equalTo: 'closed' },
        },
        referralViews: limeCourseClosedReferralViews,
        totalElements: limeCourseClosedReferralViews.length,
      })
    })

    it('shows the correct information', () => {
      const path = assessPaths.caseList.show({ courseId: limeCourse.id, referralStatusGroup: 'closed' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders,
        course: limeCourse,
        referralViews: limeCourseClosedReferralViews,
      })
      caseListPage.shouldContainCourseNavigation(path, courses)
      caseListPage.shouldHaveSelectedFilterValues('', '')
      caseListPage.shouldContainStatusNavigation('closed', limeCourse.id, {
        closed: limeCourseClosedReferralViews.length,
        open: limeCourseOpenReferralViews.length,
      })
      caseListPage.shouldContainTableOfReferralViews(assessPaths)
    })
  })
})
