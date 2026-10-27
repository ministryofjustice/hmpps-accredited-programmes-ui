import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import { referralFactory, referralViewFactory } from '../../../server/testutils/factories'
import FactoryHelpers from '../../../server/testutils/factories/factoryHelpers'
import { PathUtils } from '../../../server/utils'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { CaseListColumnHeader } from '@accredited-programmes/ui'

context('Referral case lists', () => {
  const openStatuses = ['assessment_started', 'awaiting_assessment', 'referral_submitted']
  const openReferralViews = FactoryHelpers.buildListWith(
    referralViewFactory,
    {},
    { transient: { availableStatuses: openStatuses } },
    15,
  )
  const draftReferrals = referralFactory.buildList(5)
  const draftReferralViews = draftReferrals.map(referral => {
    return referralViewFactory.build({ id: referral.id, status: 'referral_started' })
  })
  const closedReferralViews = FactoryHelpers.buildListWith(
    referralViewFactory,
    {},
    { transient: { availableStatuses: ['programme_complete'] } },
    10,
  )
  const baseColumnHeaders: Array<CaseListColumnHeader> = [
    'Name and prison number',
    'Date referred',
    'Earliest release date',
    'Programme location',
    'Programme name',
  ]
  const nonDraftReferralsColumnHeaders: Array<CaseListColumnHeader> = baseColumnHeaders.concat('Referral status')
  const draftReferralsColumnHeaders: Array<CaseListColumnHeader> = baseColumnHeaders.concat('Progress')

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'open' } },
      referralViews: openReferralViews,
      totalElements: openReferralViews.length,
    })
    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'draft' } },
      referralViews: draftReferralViews,
      totalElements: draftReferralViews.length,
    })
    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'closed' } },
      referralViews: closedReferralViews,
      totalElements: closedReferralViews.length,
    })
  })

  describe('when viewing open referrals', () => {
    it('shows the correct information', () => {
      const path = referPaths.caseList.show({ referralStatusGroup: 'open' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: nonDraftReferralsColumnHeaders,
        referralViews: openReferralViews,
      })
      caseListPage.shouldContainSearchInput()
      caseListPage.shouldContainStatusNavigation('open', undefined, { closed: 10, draft: 5, open: 15 })
      caseListPage.shouldContainTableOfReferralViews(referPaths)
    })

    it('includes pagination', () => {
      cy.task('stubFindMyReferralViews', {
        queryParameters: { page: { equalTo: '3' }, statusGroup: { equalTo: 'open' } },
        referralViews: openReferralViews,
        totalPages: 7,
      })
      cy.task('stubFindMyReferralViews', {
        queryParameters: { page: { equalTo: '4' }, statusGroup: { equalTo: 'open' } },
        referralViews: openReferralViews,
        totalPages: 7,
      })

      const path = PathUtils.pathWithQuery(referPaths.caseList.show({ referralStatusGroup: 'open' }), [
        { key: 'page', value: '4' },
      ])
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: nonDraftReferralsColumnHeaders,
        referralViews: openReferralViews,
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

    it('does not show the table and displays a message when there are no referrals', () => {
      cy.task('stubFindMyReferralViews', {
        queryParameters: { statusGroup: { equalTo: 'open' } },
        referralViews: [],
        totalElements: 0,
      })

      const path = referPaths.caseList.show({ referralStatusGroup: 'open' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: nonDraftReferralsColumnHeaders,
        referralViews: [],
      })
      caseListPage.shouldContainStatusNavigation('open', undefined, { closed: 10, draft: 5, open: 0 })
      caseListPage.shouldNotContainTable()
      caseListPage.shouldNotContainPagination()
      caseListPage.shouldContainText('You have no open referrals.')
    })
  })

  describe('when viewing draft referrals', () => {
    beforeEach(() => {
      draftReferrals.forEach(referral => cy.task('stubReferral', referral))
    })

    it('shows the correct information', () => {
      const path = referPaths.caseList.show({ referralStatusGroup: 'draft' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: draftReferralsColumnHeaders,
        referralStatusGroup: 'draft',
        referralViews: draftReferralViews,
      })
      caseListPage.shouldContainStatusNavigation('draft', undefined, { closed: 10, draft: 5, open: 15 })
      caseListPage.shouldContainTableOfReferralViews(referPaths)
    })

    it('includes pagination', () => {
      cy.task('stubFindMyReferralViews', {
        queryParameters: { page: { equalTo: '3' }, statusGroup: { equalTo: 'draft' } },
        referralViews: draftReferralViews,
        totalPages: 7,
      })
      cy.task('stubFindMyReferralViews', {
        queryParameters: { page: { equalTo: '4' }, statusGroup: { equalTo: 'draft' } },
        referralViews: draftReferralViews,
        totalPages: 7,
      })

      const path = PathUtils.pathWithQuery(referPaths.caseList.show({ referralStatusGroup: 'draft' }), [
        { key: 'page', value: '4' },
      ])
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: draftReferralsColumnHeaders,
        referralStatusGroup: 'draft',
        referralViews: draftReferralViews,
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
  })

  describe('when viewing closed referrals', () => {
    it('shows the correct information', () => {
      const path = referPaths.caseList.show({ referralStatusGroup: 'closed' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: baseColumnHeaders,
        referralStatusGroup: 'closed',
        referralViews: closedReferralViews,
      })
      caseListPage.shouldContainStatusNavigation('closed', undefined, { closed: 10, draft: 5, open: 15 })
      caseListPage.shouldContainTableOfReferralViews(referPaths)
    })

    it('includes pagination', () => {
      cy.task('stubFindMyReferralViews', {
        queryParameters: { page: { equalTo: '3' }, statusGroup: { equalTo: 'closed' } },
        referralViews: closedReferralViews,
        totalPages: 7,
      })
      cy.task('stubFindMyReferralViews', {
        queryParameters: { page: { equalTo: '4' }, statusGroup: { equalTo: 'closed' } },
        referralViews: closedReferralViews,
        totalPages: 7,
      })

      const path = PathUtils.pathWithQuery(referPaths.caseList.show({ referralStatusGroup: 'closed' }), [
        { key: 'page', value: '4' },
      ])
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: baseColumnHeaders,
        referralStatusGroup: 'closed',
        referralViews: closedReferralViews,
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
  })

  describe('when visiting the index, without specifying a status group', () => {
    it('redirects to the open referrals case list page', () => {
      const path = referPaths.caseList.index({})
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: nonDraftReferralsColumnHeaders,
        referralViews: openReferralViews,
      })
      caseListPage.shouldContainStatusNavigation('open', undefined, { closed: 10, draft: 5, open: 15 })
      caseListPage.shouldContainTableOfReferralViews(referPaths)
    })
  })

  describe('when searching for a referral', () => {
    it('filters the referrals by name or ID', () => {
      const searchQuery = { nameOrId: { equalTo: 'Hatton' } }
      const searchResultReferralViews = FactoryHelpers.buildListWith(
        referralViewFactory,
        { surname: 'Hatton' },
        { transient: { availableStatuses: openStatuses } },
        10,
      )

      cy.task('stubFindMyReferralViews', {
        queryParameters: { ...searchQuery, statusGroup: { equalTo: 'open' } },
        referralViews: searchResultReferralViews,
        totalElements: searchResultReferralViews.length,
      })
      cy.task('stubFindMyReferralViews', {
        queryParameters: { ...searchQuery, statusGroup: { equalTo: 'closed' } },
        referralViews: [],
        totalElements: 0,
      })
      cy.task('stubFindMyReferralViews', {
        queryParameters: { ...searchQuery, statusGroup: { equalTo: 'draft' } },
        referralViews: [],
        totalElements: 0,
      })

      const path = referPaths.caseList.show({ referralStatusGroup: 'open' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: nonDraftReferralsColumnHeaders,
        referralViews: searchResultReferralViews,
      })

      caseListPage.shouldContainSearchInput()
      caseListPage.searchFor('Hatton')
      caseListPage.shouldContainSearchInput('Hatton')
      caseListPage.shouldContainStatusNavigation(
        'open',
        undefined,
        {
          closed: 0,
          draft: 0,
          open: searchResultReferralViews.length,
        },
        [{ key: 'nameOrId', value: 'Hatton' }],
      )
      caseListPage.shouldContainTableOfReferralViews(referPaths)
    })
  })
})
