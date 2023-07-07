import helpers from '../support/helpers'
import type { ObjectWithHtmlString, ObjectWithTextString, SummaryListRow, Tag } from '@accredited-programmes/ui'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T, U = unknown>(constructor: new (...args: Array<U>) => T, ...args: Array<U>): T {
    return new constructor(...args)
  }

  constructor(private readonly mainHeading: string, private readonly customTitle?: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    if (this.customTitle) {
      cy.title().should('equal', `HMPPS Accredited Programmes - ${this.customTitle}`)
    }

    cy.get('.govuk-heading-l').contains(this.mainHeading)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  shouldContainSummaryListRows(rows: Array<SummaryListRow>, summaryListElement: JQuery<HTMLElement>): void {
    cy.wrap(summaryListElement).within(() => {
      cy.get('.govuk-summary-list__row').each((rowElement, rowElementIndex) => {
        cy.wrap(rowElement).within(() => {
          const row = rows[rowElementIndex]

          cy.get('.govuk-summary-list__key').then(summaryListKeyElement => {
            const { actual, expected } = helpers.parseHtml(summaryListKeyElement, row.key.text)
            expect(actual).to.equal(expected)
          })

          cy.get('.govuk-summary-list__value').then(summaryListValueElement => {
            const expectedValue =
              'text' in row.value ? (row.value as ObjectWithTextString).text : (row.value as ObjectWithHtmlString).html
            const { actual, expected } = helpers.parseHtml(summaryListValueElement, expectedValue)
            expect(actual).to.equal(expected)
          })
        })
      })
    })
  }

  shouldContainTags(tags: Array<Tag>, tagContainerElement: JQuery<HTMLElement>): void {
    cy.wrap(tagContainerElement).within(() => {
      cy.get('.govuk-tag').each((tagElement, tagElementIndex) => {
        const tag = tags[tagElementIndex]
        const { actual, expected } = helpers.parseHtml(tagElement, tag.text)
        expect(actual).to.equal(expected)
        cy.wrap(tagElement).should('have.class', tag.classes)
      })
    })
  }
}
