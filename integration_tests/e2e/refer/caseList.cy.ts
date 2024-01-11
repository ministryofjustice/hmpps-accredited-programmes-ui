import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import { referralFactory, referralSummaryFactory } from '../../../server/testutils/factories'
import FactoryHelpers from '../../../server/testutils/factories/factoryHelpers'
import { PathUtils } from '../../../server/utils'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { CaseListColumnHeader } from '@accredited-programmes/ui'

context('Referral case lists', () => {
  const openStatuses = ['assessment_started', 'awaiting_assessment', 'referral_submitted']
  const openReferralSummaries = FactoryHelpers.buildListWith(
    referralSummaryFactory,
    {},
    { transient: { availableStatuses: openStatuses } },
    15,
  )
  const draftReferrals = referralFactory.buildList(15)
  const draftReferralSummaries = draftReferrals.map(referral => {
    return referralSummaryFactory.build({ id: referral.id, status: 'referral_started' })
  })
  const baseColumnHeaders: Array<CaseListColumnHeader> = [
    'Name / Prison number',
    'Date referred',
    'Earliest release date',
    'Release date type',
    'Programme location',
    'Programme name',
  ]
  const openReferralsColumnHeaders: Array<CaseListColumnHeader> = baseColumnHeaders.concat('Referral status')
  const draftReferralsColumnHeaders: Array<CaseListColumnHeader> = baseColumnHeaders.concat('Progress')

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()
  })

  describe('when viewing open referrals', () => {
    it('shows the correct information', () => {
      cy.task('stubFindMyReferralSummaries', {
        referralStatusGroup: 'open',
        referralSummaries: openReferralSummaries,
      })

      const path = referPaths.caseList.show({ referralStatusGroup: 'open' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: openReferralsColumnHeaders,
        referralSummaries: openReferralSummaries,
      })
      caseListPage.shouldContainStatusNavigation('open')
      caseListPage.shouldContainTableOfReferralSummaries(referPaths)
    })

    it('includes pagination', () => {
      cy.task('stubFindMyReferralSummaries', {
        queryParameters: { page: { equalTo: '3' } },
        referralStatusGroup: 'open',
        referralSummaries: openReferralSummaries,
        totalPages: 7,
      })
      cy.task('stubFindMyReferralSummaries', {
        queryParameters: { page: { equalTo: '4' } },
        referralStatusGroup: 'open',
        referralSummaries: openReferralSummaries,
        totalPages: 7,
      })

      const path = PathUtils.pathWithQuery(referPaths.caseList.show({ referralStatusGroup: 'open' }), [
        { key: 'page', value: '4' },
      ])
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: openReferralsColumnHeaders,
        referralSummaries: openReferralSummaries,
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

  describe('when viewing draft referrals', () => {
    beforeEach(() => {
      draftReferrals.forEach(referral => cy.task('stubReferral', referral))
    })

    it('shows the correct information', () => {
      cy.task('stubFindMyReferralSummaries', {
        referralStatusGroup: 'draft',
        referralSummaries: draftReferralSummaries,
      })

      const path = referPaths.caseList.show({ referralStatusGroup: 'draft' })
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: draftReferralsColumnHeaders,
        referralSummaries: draftReferralSummaries,
      })
      caseListPage.shouldContainStatusNavigation('draft')
      caseListPage.shouldContainTableOfReferralSummaries(referPaths)
    })

    it('includes pagination', () => {
      cy.task('stubFindMyReferralSummaries', {
        queryParameters: { page: { equalTo: '3' } },
        referralStatusGroup: 'draft',
        referralSummaries: draftReferralSummaries,
        totalPages: 7,
      })
      cy.task('stubFindMyReferralSummaries', {
        queryParameters: { page: { equalTo: '4' } },
        referralStatusGroup: 'draft',
        referralSummaries: draftReferralSummaries,
        totalPages: 7,
      })

      const path = PathUtils.pathWithQuery(referPaths.caseList.show({ referralStatusGroup: 'draft' }), [
        { key: 'page', value: '4' },
      ])
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: draftReferralsColumnHeaders,
        referralSummaries: draftReferralSummaries,
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
      cy.task('stubFindMyReferralSummaries', {
        referralStatusGroup: 'open',
        referralSummaries: openReferralSummaries,
      })

      const path = referPaths.caseList.index({})
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        columnHeaders: openReferralsColumnHeaders,
        referralSummaries: openReferralSummaries,
      })
      caseListPage.shouldContainStatusNavigation('open')
      caseListPage.shouldContainTableOfReferralSummaries(referPaths)
    })
  })
})
