import type { AxeRules } from '@accredited-programmes/integration-tests'

import { referPaths } from '../../server/paths'
import { CourseParticipationUtils, PersonUtils, ReferralUtils } from '../../server/utils'
import Helpers from '../support/helpers'
import type { Organisation, Person, Referral } from '@accredited-programmes/models'
import type {
  CourseParticipationPresenter,
  CoursePresenter,
  GovukFrontendRadiosItemWithLabel,
  GovukFrontendSummaryListCardActionsItemWithText,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendTagWithText,
  HasHtmlString,
  HasTextString,
} from '@accredited-programmes/ui'
import type { GovukFrontendSummaryListCardTitle, GovukFrontendWarningText } from '@govuk-frontend'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T, U = unknown>(constructor: new (...args: Array<U>) => T, ...args: Array<U>): T {
    return new constructor(...args)
  }

  customPageTitleEnd: string | undefined

  external: boolean

  constructor(
    private readonly pageHeading: string,
    options?: {
      accessibilityRules?: AxeRules
      customPageTitleEnd?: string
      external?: boolean
    },
  ) {
    this.customPageTitleEnd = options?.customPageTitleEnd
    this.external = options?.external || false
    this.checkOnPage()
    if (!this.external) {
      cy.checkAccessibility(options?.accessibilityRules)
    }
  }

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  selectRadioButton(name: string, value: string): void {
    cy.get(`.govuk-radios__input[name="${name}"][value="${value}"]`).check()
  }

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

  shouldContainCourseOfferingSummaryList(course: CoursePresenter, organisationName: Organisation['name']) {
    cy.get('[data-testid="course-offering-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        ReferralUtils.courseOfferingSummaryListRows(course, organisationName),
        summaryListElement,
      )
    })
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

  shouldContainHistorySummaryCards(
    participations: Array<CourseParticipationPresenter>,
    referralId: Referral['id'],
    withActions = { change: true, remove: true },
  ) {
    participations
      .sort((participationA, participationB) => participationA.createdAt.localeCompare(participationB.createdAt))
      .forEach((participation, participationsIndex) => {
        const { rows } = CourseParticipationUtils.summaryListOptions(participation, referralId)

        cy.get('.govuk-summary-card')
          .eq(participationsIndex)
          .then(summaryCardElement => {
            const actions = []

            if (withActions.change) {
              actions.push({
                href: referPaths.new.programmeHistory.editProgramme({
                  courseParticipationId: participation.id,
                  referralId,
                }),
                text: 'Change',
                visuallyHiddenText: ` participation for ${participation.courseName}`,
              })
            }

            if (withActions.remove) {
              actions.push({
                href: referPaths.new.programmeHistory.delete({
                  courseParticipationId: participation.id,
                  referralId,
                }),
                text: 'Remove',
                visuallyHiddenText: ` participation for ${participation.courseName}`,
              })
            }

            this.shouldContainSummaryCard(participation.courseName, actions, rows, summaryCardElement)
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

  shouldContainRadioItems(options: Array<GovukFrontendRadiosItemWithLabel>): void {
    options.forEach((option, optionIndex) => {
      cy.get('.govuk-radios__item')
        .eq(optionIndex)
        .within(() => {
          cy.get('.govuk-radios__label').then(radioButtonLabelElement => {
            const { actual, expected } = Helpers.parseHtml(radioButtonLabelElement, option.label)
            expect(actual).to.equal(expected)
          })
          cy.get('.govuk-radios__input').should('have.attr', 'value', option.value)
        })
    })
  }

  shouldContainSubmissionSummaryList(referral: Referral): void {
    cy.get('[data-testid="submission-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(ReferralUtils.submissionSummaryListRows(referral), summaryListElement)
    })
  }

  shouldContainSubmittedReferralSideNavigation(currentPath: string, referralId: Referral['id']): void {
    const navigationItems = ReferralUtils.viewReferralNavigationItems('/', referralId)

    cy.get('.moj-side-navigation__item').each((navigationItemElement, navigationItemElementIndex) => {
      const { href, text } = navigationItems[navigationItemElementIndex]

      const { actual, expected } = Helpers.parseHtml(navigationItemElement, text)
      expect(actual).to.equal(expected)

      cy.wrap(navigationItemElement).within(() => {
        cy.get('a').should('have.attr', 'href', href)

        if (currentPath === href) {
          cy.get('a').should('have.attr', 'aria-current', 'location')
        } else {
          cy.get('a').should('not.have.attr', 'aria-current', 'location')
        }
      })
    })
  }

  shouldContainSummaryCard(
    title: GovukFrontendSummaryListCardTitle['text'],
    actions: Array<GovukFrontendSummaryListCardActionsItemWithText>,
    rows: Array<GovukFrontendSummaryListRowWithKeyAndValue>,
    summaryCardElement: JQuery<HTMLElement>,
  ): void {
    cy.wrap(summaryCardElement).within(() => {
      cy.get('.govuk-summary-card__title').should('have.text', title)

      actions.forEach((action, actionIndex) => {
        cy.get('.govuk-summary-card__actions .govuk-link')
          .eq(actionIndex)
          .then(actionElement => {
            let { text } = action

            if (action.visuallyHiddenText) {
              text += ` ${action.visuallyHiddenText}`

              cy.wrap(actionElement).within(() => {
                cy.get('.govuk-visually-hidden').should('have.text', action.visuallyHiddenText)
              })
            }

            const { actual, expected } = Helpers.parseHtml(actionElement, text)
            expect(actual).to.equal(expected)

            cy.wrap(actionElement).should('have.attr', 'href', action.href)
          })
      })

      cy.get('.govuk-summary-list').then(summaryListElement => {
        this.shouldContainSummaryListRows(rows, summaryListElement)
      })
    })
  }

  shouldContainSummaryListRows(
    rows: Array<GovukFrontendSummaryListRowWithKeyAndValue>,
    summaryListElement: JQuery<HTMLElement>,
  ): void {
    cy.wrap(summaryListElement).within(() => {
      cy.get('.govuk-summary-list__row').each((rowElement, rowElementIndex) => {
        cy.wrap(rowElement).within(() => {
          const row = rows[rowElementIndex]

          cy.get('.govuk-summary-list__key').then(summaryListKeyElement => {
            const expectedValue = 'text' in row.key ? (row.key as HasTextString).text : (row.key as HasHtmlString).html
            const { actual, expected } = Helpers.parseHtml(summaryListKeyElement, expectedValue)
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

  shouldContainTextArea(id: string, label: string): void {
    cy.get(`.govuk-label[for="${id}"]`).should('contain.text', label)
    cy.get(`.govuk-textarea[id="${id}"]`).should('exist')
  }

  shouldContainWarningText(text: GovukFrontendWarningText['text']): void {
    cy.get('.govuk-warning-text__text').should('contain.text', text)
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
