import helpers from '../support/helpers'
import type { Organisation } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithValue,
  HasHtmlString,
  HasTextString,
} from '@accredited-programmes/ui'
import type { GovukFrontendTag } from '@govuk-frontend'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  customPageTitleEnd: string | undefined

  external: boolean

  static verifyOnPage<T, U = unknown>(constructor: new (...args: Array<U>) => T, ...args: Array<U>): T {
    return new constructor(...args)
  }

  constructor(
    private readonly pageHeading: string,
    options?: { customPageTitleEnd?: string; external?: boolean },
  ) {
    this.customPageTitleEnd = options?.customPageTitleEnd
    this.external = options?.external || false
    this.checkOnPage()
    if (!this.external) {
      cy.checkAccessibility()
    }
  }

  private checkOnPage(): void {
    if (!this.external) {
      this.checkTitle()
    }

    this.checkHeading()
  }

  private checkTitle(): void {
    let expectedTitle = 'HMPPS Accredited Programmes'
    const pageTitleEnd = this.customPageTitleEnd || this.pageHeading

    if (pageTitleEnd) {
      expectedTitle += ` - ${pageTitleEnd}`
    }

    cy.title().should('equal', expectedTitle)
  }

  private checkHeading(): void {
    cy.get('.govuk-heading-l').contains(this.pageHeading)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  shouldContainBackLink(href: string): void {
    cy.get('.govuk-back-link').should('have.attr', 'href', href)
  }

  shouldContainButtonLink(text: string, href: string): void {
    cy.get('.govuk-button').then(buttonElement => {
      const { actual, expected } = helpers.parseHtml(buttonElement, text)
      expect(actual).to.equal(expected)
      cy.wrap(buttonElement).should('have.attr', 'href', href)
    })
  }

  shouldContainNavigation(currentPath: string): void {
    const navigationItems = [{ text: 'List of programmes', href: '/programmes' }]

    cy.get('.moj-primary-navigation__item').each((navigationItemElement, navigationItemElementIndex) => {
      const { text, href } = navigationItems[navigationItemElementIndex]

      const { actual, expected } = helpers.parseHtml(navigationItemElement, text)
      expect(actual).to.equal(expected)

      cy.wrap(navigationItemElement).within(() => {
        cy.get('a').should('have.attr', 'href', href)

        if (currentPath === href) {
          cy.get('a').should('have.attr', 'aria-current', 'page')
        } else {
          cy.get('a').should('not.have.attr', 'aria-current', 'page')
        }
      })
    })
  }

  shouldNotContainNavigation(): void {
    cy.get('.moj-primary-navigation').should('not.exist')
  }

  shouldContainOrganisationAndCourseHeading(pageWithOrganisationAndCoursePresenter: {
    organisation: Organisation
    course: CoursePresenter
  }): void {
    const { course, organisation } = pageWithOrganisationAndCoursePresenter

    cy.get('h2:nth-of-type(1)').then(organisationAndCourseHeading => {
      const expectedText = `${organisation.name} | ${course.nameAndAlternateName}`
      const { actual, expected } = helpers.parseHtml(organisationAndCourseHeading, expectedText)
      expect(actual).to.equal(expected)
    })
  }

  shouldContainSummaryListRows(
    rows: Array<GovukFrontendSummaryListRowWithValue>,
    summaryListElement: JQuery<HTMLElement>,
  ): void {
    cy.wrap(summaryListElement).within(() => {
      cy.get('.govuk-summary-list__row').each((rowElement, rowElementIndex) => {
        cy.wrap(rowElement).within(() => {
          const row = rows[rowElementIndex]

          cy.get('.govuk-summary-list__key').then(summaryListKeyElement => {
            const { actual, expected } = helpers.parseHtml(summaryListKeyElement, (row.key as HasTextString).text)
            expect(actual).to.equal(expected)
          })

          cy.get('.govuk-summary-list__value').then(summaryListValueElement => {
            const expectedValue =
              'text' in row.value ? (row.value as HasTextString).text : (row.value as HasHtmlString).html
            const { actual, expected } = helpers.parseHtml(summaryListValueElement, expectedValue)
            expect(actual).to.equal(expected)
          })
        })
      })
    })
  }

  shouldContainTags(tags: Array<GovukFrontendTag & HasTextString>, tagContainerElement: JQuery<HTMLElement>): void {
    cy.wrap(tagContainerElement).within(() => {
      cy.get('.govuk-tag').each((tagElement, tagElementIndex) => {
        const tag = tags[tagElementIndex]
        const { actual, expected } = helpers.parseHtml(tagElement, tag.text)
        expect(actual).to.equal(expected)
        cy.wrap(tagElement).should('have.class', tag.classes)
      })
    })
  }

  shouldHaveAudience(audienceTags: CoursePresenter['audienceTags']) {
    cy.get('.govuk-main-wrapper').within(() => {
      cy.get('p:first-of-type').then(tagContainerElement => {
        this.shouldContainTags(audienceTags, tagContainerElement)
      })
    })
  }
}
