import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { referralSummaryFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'

context('Referral case lists', () => {
  const referralSummaries = referralSummaryFactory.buildList(15)

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()
  })

  it('shows the correct information', () => {
    cy.task('stubFindReferralSummaries', { organisationId: 'MRI', referralSummaries })

    const path = assessPaths.caseList.show({})
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      referralSummaries,
    })
    caseListPage.shouldHaveSelectedFilterValues('', '')
    caseListPage.shouldContainTableOfReferralSummaries()
  })

  describe('when using the filters', () => {
    it('shows the correct information', () => {
      cy.task('stubFindReferralSummaries', { organisationId: 'MRI', referralSummaries })

      const path = assessPaths.caseList.show({})
      cy.visit(path)

      const caseListPage = Page.verifyOnPage(CaseListPage, {
        referralSummaries,
      })
      caseListPage.shouldContainTableOfReferralSummaries()

      const programmeStrandSelectedValue = 'general offence'
      const referralStatusSelectedValue = 'assessment started'
      const filteredReferralSummaries = [
        referralSummaryFactory.build({ audiences: ['General offence'], status: 'assessment_started' }),
      ]

      caseListPage.shouldFilter(programmeStrandSelectedValue, referralStatusSelectedValue, filteredReferralSummaries)

      const filteredCaseListPage = Page.verifyOnPage(CaseListPage, {
        referralSummaries: filteredReferralSummaries,
      })
      caseListPage.shouldHaveSelectedFilterValues(programmeStrandSelectedValue, referralStatusSelectedValue)
      filteredCaseListPage.shouldContainTableOfReferralSummaries()
    })
  })
})
