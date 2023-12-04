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
          cy.get('.govuk-table__cell:nth-of-type(4)').should('have.text', summary.audiences.join(', '))
          cy.get('.govuk-table__cell:nth-of-type(5)').should('have.html', ReferralUtils.statusTagHtml(summary.status))
        })
      })
    })
  }

  shouldFilter(
    programmeStrandSelectedValue: string,
    referralStatusSelectedValue: string,
    filteredReferralSummaries: Array<ReferralSummary>,
  ) {
    cy.task('stubFindReferralSummaries', {
      organisationId: 'MRI',
      queryParameters: {
        audience: { equalTo: ReferralUtils.uiToApiAudienceQueryParam(programmeStrandSelectedValue) },
        status: { equalTo: ReferralUtils.uiToApiStatusQueryParam(referralStatusSelectedValue) },
      },
      referralSummaries: filteredReferralSummaries,
    })

    this.selectSelectItem('programme-strand-select', programmeStrandSelectedValue)
    this.selectSelectItem('referral-status-select', referralStatusSelectedValue)
    this.shouldContainButton('Apply filters').click()
  }

  shouldHaveSelectedFilterValues(programmeStrandSelectedValue: string, referralStatusSelectedValue: string) {
    this.shouldHaveSelectValue('programme-strand-select', programmeStrandSelectedValue)
    this.shouldHaveSelectValue('referral-status-select', referralStatusSelectedValue)
  }
}
