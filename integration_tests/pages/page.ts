import { PersonUtils } from '../../server/utils'
import Helpers from '../support/helpers'
import type { Organisation, Person } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithValue,
  GovukFrontendTagWithText,
  HasHtmlString,
  HasTextString,
} from '@accredited-programmes/ui'
import type { GovukFrontendSummaryListCardTitle } from '@govuk-frontend'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T, U = unknown>(constructor: new (...args: Array<U>) => T, ...args: Array<U>): T {
    return new constructor(...args)
  }

  customPageTitleEnd: string | undefined

  external: boolean

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

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  shouldContainAudienceTags(audienceTags: CoursePresenter['audienceTags']) {
    cy.get('.govuk-main-wrapper').within(() => {
      cy.get('p:first-of-type').then(tagContainerElement => {
        this.shouldContainTags(audienceTags, tagContainerElement)
      })
    })
  }

  shouldContainBackLink(href: string): void {
    cy.get('.govuk-back-link').should('have.attr', 'href', href)
  }

  shouldContainButton(text: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains('.govuk-button', text)
  }

  shouldContainButtonLink(text: string, href: string): void {
    this.shouldContainButton(text).then(buttonElement => {
      cy.wrap(buttonElement).should('have.attr', 'href', href)
    })
  }

  shouldContainCheckbox(name: string, label: string): void {
    cy.get(`.govuk-checkboxes__input[name="${name}"]`).should('exist')
    cy.get(`.govuk-checkboxes__label[for="${name}"]`).should('contain.text', label)
  }

  shouldContainDetails(summaryText: string, detailsText: string, detailsElement: JQuery<HTMLElement>): void {
    cy.wrap(detailsElement).within(() => {
      cy.get('.govuk-details__summary-text').should('contain.text', summaryText)

      cy.get('.govuk-details__text').then(detailsTextElement => {
        const { actual, expected } = Helpers.parseHtml(detailsTextElement, detailsText)
        expect(actual).to.equal(expected)
      })
    })
  }

  shouldContainLink(text: string, href: string): void {
    cy.contains('.govuk-link', text).should('have.attr', 'href', href)
  }

  shouldContainNavigation(currentPath: string): void {
    const navigationItems = [{ href: '/programmes', text: 'List of programmes' }]

    cy.get('.moj-primary-navigation__item').each((navigationItemElement, navigationItemElementIndex) => {
      const { href, text } = navigationItems[navigationItemElementIndex]

      const { actual, expected } = Helpers.parseHtml(navigationItemElement, text)
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

  shouldContainNotificationBanner(text: string, notificationBannerElement: JQuery<HTMLElement>): void {
    cy.wrap(notificationBannerElement).within(() => {
      cy.get('.govuk-notification-banner__content').then(contentElement => {
        const { actual, expected } = Helpers.parseHtml(contentElement, text)
        expect(actual).to.equal(expected)
      })
    })
  }

  shouldContainOrganisationAndCourseHeading(pageWithOrganisationAndCoursePresenter: {
    course: CoursePresenter
    organisation: Organisation
  }): void {
    const { course, organisation } = pageWithOrganisationAndCoursePresenter

    cy.get('.govuk-grid-column-two-thirds > h2:first-child').then(organisationAndCourseHeading => {
      const expectedText = `${organisation.name} | ${course.nameAndAlternateName}`
      const { actual, expected } = Helpers.parseHtml(organisationAndCourseHeading, expectedText)
      expect(actual).to.equal(expected)
    })
  }

  shouldContainPanel(text: string): void {
    cy.contains('.govuk-panel', text)
  }

  shouldContainPersonSummaryList(person: Person): void {
    cy.get('[data-testid="person-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(PersonUtils.summaryListRows(person), summaryListElement)
    })
  }

  shouldContainSummaryCard(
    title: GovukFrontendSummaryListCardTitle['text'],
    rows: Array<GovukFrontendSummaryListRowWithValue>,
    summaryCardElement: JQuery<HTMLElement>,
  ): void {
    cy.wrap(summaryCardElement).within(() => {
      cy.get('.govuk-summary-card__title').should('have.text', title)

      cy.get('.govuk-summary-list').then(summaryListElement => {
        this.shouldContainSummaryListRows(rows, summaryListElement)
      })
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
            const { actual, expected } = Helpers.parseHtml(summaryListKeyElement, (row.key as HasTextString).text)
            expect(actual).to.equal(expected)
          })

          cy.get('.govuk-summary-list__value').then(summaryListValueElement => {
            const expectedValue =
              'text' in row.value ? (row.value as HasTextString).text : (row.value as HasHtmlString).html
            const { actual, expected } = Helpers.parseHtml(summaryListValueElement, expectedValue)
            expect(actual).to.equal(expected)
          })
        })
      })
    })
  }

  shouldContainTag(tag: GovukFrontendTagWithText, tagElement: JQuery<HTMLElement>): void {
    const { actual, expected } = Helpers.parseHtml(tagElement, tag.text)
    expect(actual).to.equal(expected)
    cy.wrap(tagElement).should('have.class', tag.classes)
  }

  shouldContainTags(tags: Array<GovukFrontendTagWithText>, tagContainerElement: JQuery<HTMLElement>): void {
    cy.wrap(tagContainerElement).within(() => {
      cy.get('.govuk-tag').each((tagElement, tagElementIndex) => {
        const tag = tags[tagElementIndex]
        this.shouldContainTag(tag, tagElement)
      })
    })
  }

  shouldContainTextArea(name: string, label: string): void {
    cy.get(`.govuk-label[for="${name}"]`).should('contain.text', label)
    cy.get(`.govuk-textarea[name="${name}"]`).should('exist')
  }

  shouldHaveErrors(errors: Array<{ field: string; message: string }>): void {
    cy.get('.govuk-error-summary').should('exist')

    errors.forEach((error, errorIndex) => {
      cy.get('.govuk-error-summary__list li')
        .eq(errorIndex)
        .within(errorSummaryListItemElement => {
          const { actual, expected } = Helpers.parseHtml(errorSummaryListItemElement, error.message)
          expect(actual).to.equal(expected)

          cy.get('a').should('have.attr', 'href', `#${error.field}`)
        })

      cy.get(`#${error.field}-error`).then(fieldErrorElement => {
        const { actual, expected } = Helpers.parseHtml(fieldErrorElement, `Error: ${error.message}`)
        expect(actual).to.equal(expected)
      })
    })
  }

  shouldHavePersonDetails(person: Person): void {
    cy.get('.person-details-banner__top-block .govuk-visually-hidden').should('have.text', 'Name:')

    cy.get('.person-details-banner__name').then(nameElement => {
      const { actual, expected } = Helpers.parseHtml(nameElement, person.name)
      expect(actual).to.equal(expected)
    })

    cy.get('.person-details-banner__bottom-block').then(detailsElement => {
      const detailsText = `Prison number: ${person.prisonNumber} | Current prison: ${person.currentPrison}`
      const { actual, expected } = Helpers.parseHtml(detailsElement, detailsText)
      expect(actual).to.equal(expected)
    })
  }

  shouldNotContainButtonLink(): void {
    cy.get('.govuk-button').should('not.exist')
  }

  shouldNotContainNavigation(): void {
    cy.get('.moj-primary-navigation').should('not.exist')
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  private checkHeading(): void {
    cy.get('h1').contains(this.pageHeading)
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
}
