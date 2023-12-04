import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { referralSummaryFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { ReferralSummary } from '@accredited-programmes/models'

context('Referral case lists', () => {
  const referralSummaries: Array<ReferralSummary> = [
    referralSummaryFactory.build({ prisonNumber: 'ABC123', status: 'assessment_started' }),
    referralSummaryFactory.build({ prisonNumber: 'ABC789', status: 'referral_started' }),
    referralSummaryFactory.build({ prisonNumber: 'ABC456', status: 'awaiting_assessment' }),
    referralSummaryFactory.build({ prisonNumber: 'ABC000', status: 'referral_submitted' }),
  ]

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
        referralSummaryFactory.build({
          audiences: ['General offence'],
          prisonNumber: 'ABC123',
          status: 'assessment_started',
        }),
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
