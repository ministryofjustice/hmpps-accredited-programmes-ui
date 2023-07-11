import helpers from '../support/helpers'
import type { ObjectWithHtmlString, ObjectWithTextString, SummaryListRow, Tag } from '@accredited-programmes/ui'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  customPageTitleEnd: string | undefined

  external: boolean

  static verifyOnPage<T, U = unknown>(constructor: new (...args: Array<U>) => T, ...args: Array<U>): T {
    return new constructor(...args)
  }

  constructor(private readonly pageHeading: string, options?: { customPageTitleEnd?: string; external?: boolean }) {
    this.customPageTitleEnd = options?.customPageTitleEnd
    this.external = options?.external || false
    this.checkOnPage()
  }

  checkOnPage(): void {
    if (!this.external) {
      let expectedTitle = 'HMPPS Accredited Programmes'
      const pageTitleEnd = this.customPageTitleEnd || this.pageHeading

      if (pageTitleEnd) {
        expectedTitle += ` - ${pageTitleEnd}`
      }

      cy.title().should('equal', expectedTitle)
    }

    cy.get('.govuk-heading-l').contains(this.pageHeading)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  shouldContainSummaryListRows(rows: Array<SummaryListRow | undefined>, summaryListElement: JQuery<HTMLElement>): void {
    cy.wrap(summaryListElement).within(() => {
      cy.get('.govuk-summary-list__row').each((rowElement, rowElementIndex) => {
        cy.wrap(rowElement).within(() => {
          const row = rows[rowElementIndex]

          if (row === undefined) {
            return
          }

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
