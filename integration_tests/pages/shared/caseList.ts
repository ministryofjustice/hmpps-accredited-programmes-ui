import { assessPaths } from '../../../server/paths'
import { DateUtils, ReferralUtils } from '../../../server/utils'
import Page from '../page'
import type { ReferralSummary } from '@accredited-programmes/models'

export default class CaseListPage extends Page {
  referralSummaries: Array<ReferralSummary>

  constructor(args: { referralSummaries: Array<ReferralSummary> }) {
    const { referralSummaries } = args

    super('My referrals')

    this.referralSummaries = referralSummaries
  }

  shouldContainTableOfReferralSummaries() {
    cy.get('.govuk-table__body').within(() => {
      cy.get('.govuk-table__row').each((tableRowElement, tableRowElementIndex) => {
        const summary = this.referralSummaries[tableRowElementIndex]

        cy.wrap(tableRowElement).within(() => {
          cy.get('.govuk-table__cell:first-of-type').should(
            'have.html',
            `<a class="govuk-link" href="${assessPaths.show.personalDetails({ referralId: summary.id })}">${
              summary.prisonNumber
            }</a>`,
          )
          cy.get('.govuk-table__cell:nth-of-type(2)').should(
            'have.text',
            summary.submittedOn ? DateUtils.govukFormattedFullDateString(summary.submittedOn) : 'N/A',
          )
          cy.get('.govuk-table__cell:nth-of-type(3)').should('have.text', summary.courseName)
          cy.get('.govuk-table__cell:nth-of-type(4)').should('have.html', ReferralUtils.statusTagHtml(summary.status))
        })
      })
    })
  }
}