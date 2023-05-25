import type { SummaryListRow } from '@accredited-programmes/ui'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  constructor(private readonly mainHeading: string, private readonly customTitle?: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    if (this.customTitle) {
      cy.title().should('equal', `HMPPS Accredited Programmes - ${this.customTitle}`)
    }

    cy.get('h1').contains(this.mainHeading)
  }

  parseHtml(actual: JQuery<HTMLElement>, expected: string): { actual: string; expected: string } {
    // Get rid of all whitespace in both the actual and expected text,
    // so we don't have to worry about small differences in whitespace
    const parser = new DOMParser()
    const doc = parser.parseFromString(expected, 'text/html')

    return { actual: actual.text().replace(/\s+/g, ''), expected: doc.body.innerText.replace(/\s+/g, '') }
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  shouldContainSummaryListRows(rows: Array<SummaryListRow>, summaryList: JQuery<HTMLElement>): void {
    cy.wrap(summaryList).within(() => {
      cy.get('.govuk-summary-list__row').each((rowElement, rowElementIndex) => {
        cy.wrap(rowElement).within(() => {
          const row = rows[rowElementIndex]

          cy.get('.govuk-summary-list__key').then(summaryListKeyElement => {
            const { actual, expected } = this.parseHtml(summaryListKeyElement, row.key.text)
            expect(actual).to.equal(expected)
          })

          cy.get('.govuk-summary-list__value').then(summaryListValueElement => {
            const { actual, expected } = this.parseHtml(summaryListValueElement, row.value.text)
            expect(actual).to.equal(expected)
          })
        })
      })
    })
  }
}
