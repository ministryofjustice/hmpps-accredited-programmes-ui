import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { referralSummaryFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { CaseListPage } from '../../pages/shared'
import type { ReferralSummary } from '@accredited-programmes/models'

context('Referral case lists', () => {
  let referralSummaries: Array<ReferralSummary> = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()
  })

  it('shows the correct information', () => {
    referralSummaries = [
      referralSummaryFactory.build({ prisonNumber: 'ABC123', status: 'assessment_started' }),
      referralSummaryFactory.build({ prisonNumber: 'ABC789', status: 'referral_started' }),
      referralSummaryFactory.build({ prisonNumber: 'ABC456', status: 'awaiting_assessment' }),
      referralSummaryFactory.build({ prisonNumber: 'ABC000', status: 'referral_submitted' }),
    ]

    cy.task('stubFindReferralSummaries', { organisationId: 'MRI', referralSummaries })

    const path = assessPaths.caseList.show({})
    cy.visit(path)

    const caseListPage = Page.verifyOnPage(CaseListPage, {
      referralSummaries,
    })
    caseListPage.shouldContainTableOfReferralSummaries()
  })
})
