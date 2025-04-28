import type { AxeRules } from '@accredited-programmes/integration-tests'
// eslint-disable-next-line import/extensions
import mojFrontendFilters from '@ministryofjustice/frontend/moj/filters/all.js'

import { assessPathBase, findPaths, referPaths } from '../../server/paths'
import { referPathBase } from '../../server/paths/refer'
import {
  CourseParticipationUtils,
  CourseUtils,
  DateUtils,
  PersonUtils,
  ShowReferralUtils,
  ShowRisksAndNeedsUtils,
} from '../../server/utils'
import Helpers from '../support/helpers'
import type { CourseOffering, Organisation, Person, ReferralStatusRefData } from '@accredited-programmes/models'
import type {
  CourseParticipationPresenter,
  CoursePresenter,
  GovukFrontendSummaryListCardActionsItemWithText,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendTagWithText,
  HasHtmlString,
  HasTextString,
  MojTimelineItem,
  ReferralStatusHistoryPresenter,
} from '@accredited-programmes/ui'
import type { Course, CourseParticipation, Referral } from '@accredited-programmes-api'
import type {
  GovukFrontendCheckboxesItem,
  GovukFrontendRadiosItem,
  GovukFrontendSummaryListCardTitle,
  GovukFrontendWarningText,
} from '@govuk-frontend'
import type { User } from '@manage-users-api'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T, U = unknown>(constructor: new (...args: Array<U>) => T, ...args: Array<U>): T {
    return new constructor(...args)
  }

  external: boolean

  hideTitleServiceName: boolean | undefined

  pageTitleOverride: string | undefined

  subHeading: string | undefined

  constructor(
    private readonly pageHeading: string,
    options?: {
      accessibilityRules?: AxeRules
      external?: boolean
      hideTitleServiceName?: boolean
      pageTitleOverride?: string
      subHeading?: string
    },
  ) {
    this.pageTitleOverride = options?.pageTitleOverride || pageHeading
    this.hideTitleServiceName = options?.hideTitleServiceName
    this.external = options?.external || false
    this.checkOnPage()
    if (!this.external) {
      cy.checkAccessibility(options?.accessibilityRules)
    }
  }

  clickPaginationNextButton(): void {
    this.shouldContainPaginationNextButtonLink().click()
  }

  clickPaginationPage(pageNumber: number): void {
    cy.get('.govuk-pagination__link').contains(pageNumber).click()
  }

  clickPaginationPreviousButton(): void {
    this.shouldContainPaginationPreviousButtonLink().click()
  }

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  selectCheckbox(name: string): void {
    cy.get(`.govuk-checkboxes__input[name="${name}"]`).check()
  }

  selectRadioButton(name: string, value: string): void {
    cy.get(`.govuk-radios__input[name="${name}"][value="${value}"]`).check()
  }

  selectSelectItem(testId: string, value: string): void {
    cy.get(`[data-testid="${testId}"]`).select(value)
  }

  shouldBeOnPaginationPage(pageNumber: number): void {
    cy.get('.govuk-pagination__item--current .govuk-pagination__link').then(paginationItemLinkElement => {
      const { actual, expected } = Helpers.parseHtml(paginationItemLinkElement, pageNumber.toString())
      expect(actual).to.equal(expected)
    })
  }

  shouldContainAssessmentCompletedText(date: string): void {
    cy.get('[data-testid="last-assessment-date-text"]').should('contain.text', `Assessment completed ${date}`)
  }

  shouldContainAudienceTag(audienceTag: CoursePresenter['audienceTag']) {
    cy.get('[data-testid="audience-tag"]').then(tagElement => {
      this.shouldContainTag(audienceTag, tagElement)
    })
  }

  shouldContainBackLink(href: string): void {
    cy.get('.govuk-back-link').should('have.attr', 'href', href)
  }

  shouldContainButton(text: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains('.govuk-button', text)
  }

  shouldContainButtonLink(text: string, href: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.shouldContainButton(text).then(buttonElement => {
      cy.wrap(buttonElement).should('have.attr', 'href', href)
    })
  }

  shouldContainCheckbox(name: string, label: string): void {
    cy.get(`.govuk-checkboxes__input[name="${name}"]`).should('exist')
    cy.get(`.govuk-checkboxes__label[for="${name}"]`).then(labelElement => {
      const { actual, expected } = Helpers.parseHtml(labelElement, label)
      expect(actual).to.equal(expected)
    })
  }

  shouldContainCheckboxItems(options: Array<GovukFrontendCheckboxesItem>): void {
    options.forEach((option, optionIndex) => {
      cy.get('.govuk-checkboxes__item')
        .eq(optionIndex)
        .within(() => {
          cy.get('.govuk-checkboxes__label').then(checkboxLabelElement => {
            const { actual, expected } = Helpers.parseHtml(checkboxLabelElement, option.text as string)
            expect(actual).to.equal(expected)
          })
          cy.get('.govuk-checkboxes__input').should('have.attr', 'value', option.value)
        })
    })
  }

  shouldContainCourseOfferingSummaryList(
    applicantName: User['name'],
    course: CoursePresenter,
    contactEmail: CourseOffering['contactEmail'],
    organisationName: Organisation['name'],
  ) {
    cy.get('[data-testid="course-offering-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        ShowReferralUtils.courseOfferingSummaryListRows(applicantName, course, contactEmail, organisationName),
        summaryListElement,
      )
    })
  }

  shouldContainCurrentStatusTimelineItem(statusHistoryPresenter: Array<ReferralStatusHistoryPresenter>) {
    cy.get('[data-testid="status-history-timeline"]').then(timelineElement => {
      this.shouldContainTimelineItems(
        ShowReferralUtils.statusHistoryTimelineItems(statusHistoryPresenter).slice(0, 1),
        timelineElement,
      )
    })
  }

  shouldContainDetails(summaryText: string, detailsText: string, detailsElement: JQuery<HTMLElement>): void {
    cy.wrap(detailsElement).within(() => {
      cy.get('.govuk-details__summary-text').should('have.text', summaryText)

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
            const actions: Array<GovukFrontendSummaryListCardActionsItemWithText> = []

            if (withActions.change) {
              actions.push({
                href: referPaths.new.programmeHistory.editProgramme({
                  courseParticipationId: participation.id,
                  referralId,
                }),
                text: 'Change',
                visuallyHiddenText: 'programme',
              })
            }

            if (withActions.remove) {
              actions.push({
                href: referPaths.new.programmeHistory.delete({
                  courseParticipationId: participation.id,
                  referralId,
                }),
                text: 'Remove',
                visuallyHiddenText: 'programme',
              })
            }

            this.shouldContainSummaryCard(participation.courseName, actions, rows, summaryCardElement)
          })
      })
  }

  shouldContainHistoryTable(
    participations: Array<CourseParticipation>,
    requestPath: string,
    referralId: Referral['id'],
    testId: string,
    editable = false,
  ) {
    const { rows } = CourseParticipationUtils.table(participations, requestPath, referralId, testId, editable)

    cy.get(`[data-testid="${testId}"] .govuk-table__body`).within(() => {
      cy.get('.govuk-table__row').each((tableRowElement, tableRowElementIndex) => {
        const row = rows[tableRowElementIndex]

        cy.wrap(tableRowElement).within(() => {
          row.forEach((cell, cellIndex) => {
            cy.get('.govuk-table__cell')
              .eq(cellIndex)
              .then(cellElement => {
                if ('text' in cell) {
                  cy.wrap(cellElement).should('contain.text', cell.text)
                } else {
                  cy.wrap(cellElement).should('contain.html', cell.html)
                }
              })
          })
        })
      })
    })
  }

  shouldContainHomeLink(): void {
    cy.get('[data-testid=home-link]').should('have.attr', 'href', '/')
  }

  shouldContainImportedFromText(source: 'NOMIS' | 'OASys', dataTestId = 'imported-from-text'): void {
    cy.get(`[data-testid="${dataTestId}"]`).then(importedFromElement => {
      const { actual, expected } = Helpers.parseHtml(
        importedFromElement,
        `Imported from ${source} on ${DateUtils.govukFormattedFullDateString()}.`,
      )
      expect(actual).to.equal(expected)
    })
  }

  shouldContainKeylessSummaryCard(
    title: GovukFrontendSummaryListCardTitle['text'],
    body: string,
    summaryCardElement: JQuery<HTMLElement>,
  ): void {
    cy.wrap(summaryCardElement).within(() => {
      cy.get('.govuk-summary-card__title').should('contain.text', title)

      cy.get('.govuk-summary-list__value').then(keylessSummaryCardBodyElement => {
        const { actual, expected } = Helpers.parseHtml(keylessSummaryCardBodyElement, body)
        expect(actual).to.equal(expected)
      })
    })
  }

  shouldContainLink(text: string, href: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains('.govuk-link', text).should('have.attr', 'href', href)
  }

  shouldContainNotificationBanner(title: string, expectedHtml: string): void {
    cy.get('.govuk-notification-banner').within(() => {
      cy.get('.govuk-notification-banner__header .govuk-notification-banner__title').contains(title).should('exist')
      cy.get('.govuk-notification-banner__content').then(notificationContentElement => {
        const { actual, expected } = Helpers.parseHtml(notificationContentElement, expectedHtml)
        expect(actual).to.equal(expected)
      })
    })
  }

  shouldContainOasysNomisErrorBanner(): void {
    cy.get('[data-testid="oasys-nomis-error-banner"]')
      .should('contain.text', 'OASys or NOMIS data unavailable')
      .should('contain.text', 'We cannot retrieve this information from OASys or NOMIS at the moment. Try again later.')
  }

  shouldContainOasysNomisErrorText(): void {
    cy.get('[data-testid="oasys-nomis-error-text"]').should(
      'contain.text',
      'We cannot retrieve this information from OASys or NOMIS at the moment. Try again later.',
    )
  }

  shouldContainOrganisationAndCourseHeading(pageWithOrganisationAndCoursePresenter: {
    course: CoursePresenter
    organisation: Organisation
  }): void {
    const { course, organisation } = pageWithOrganisationAndCoursePresenter

    cy.get('[data-testid="organisation-and-course"]').then(organisationAndCourseHeading => {
      const expectedText = `${organisation.name} | ${course.displayName}`
      const { actual, expected } = Helpers.parseHtml(organisationAndCourseHeading, expectedText)
      expect(actual).to.equal(expected)
    })
  }

  shouldContainPaginationItems(items: Array<string>): void {
    cy.get('.govuk-pagination__item').each((paginationItemElement, paginationItemElementIndex) => {
      const { actual, expected } = Helpers.parseHtml(paginationItemElement, items[paginationItemElementIndex])
      expect(actual).to.equal(expected)
    })
  }

  shouldContainPaginationNextButtonLink(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('.govuk-pagination__next .govuk-pagination__link').should('exist')
  }

  shouldContainPaginationPreviousButtonLink(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('.govuk-pagination__prev .govuk-pagination__link').should('exist')
  }

  shouldContainPanel(text: string): void {
    cy.contains('.govuk-panel', text)
  }

  shouldContainPersonSummaryList(person: Person): void {
    cy.get('[data-testid="person-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(PersonUtils.summaryListRows(person), summaryListElement)
    })
  }

  shouldContainRadioItems(options: Array<GovukFrontendRadiosItem>): void {
    options.forEach((option, optionIndex) => {
      cy.get('.govuk-radios__item')
        .eq(optionIndex)
        .within(() => {
          cy.get('.govuk-radios__label').then(radioButtonLabelElement => {
            const { actual, expected } = Helpers.parseHtml(radioButtonLabelElement, option.text as string)
            expect(actual).to.equal(expected)
          })
          cy.get('.govuk-radios__input').should('have.attr', 'value', option.value)
        })
    })
  }

  shouldContainRisksAndNeedsOasysMessage(): void {
    cy.get('[data-testid="risks-and-needs-oasys-message"]').should(
      'have.text',
      'Relevant information to support the referral, taken from the latest approved assessment in OASys. The full risk and need assessment is available in OASys.',
    )
  }

  shouldContainRisksAndNeedsSideNavigation(currentPath: string, referralId: Referral['id']): void {
    const currentBasePath = currentPath.startsWith(assessPathBase.pattern)
      ? assessPathBase.pattern
      : referPathBase.pattern
    const navigationItems = ShowRisksAndNeedsUtils.navigationItems(currentBasePath, referralId)

    cy.get('.moj-side-navigation__item').each((navigationItemElement, navigationItemElementIndex) => {
      const { href, text } = navigationItems[navigationItemElementIndex]

      const { actual, expected } = Helpers.parseHtml(navigationItemElement, text)
      expect(actual).to.equal(expected)

      cy.wrap(navigationItemElement).within(() => {
        cy.get('a').should('have.attr', 'href', href)

        if (currentPath === href.replace('#content', '')) {
          cy.get('a').should('have.attr', 'aria-current', 'location')
        } else {
          cy.get('a').should('not.have.attr', 'aria-current', 'location')
        }
      })
    })
  }

  shouldContainShowReferralButtons(
    currentPath: string,
    referral: Referral,
    statusTransitions?: Array<ReferralStatusRefData>,
  ): void {
    const currentBasePath = currentPath.startsWith(assessPathBase.pattern)
      ? assessPathBase.pattern
      : referPathBase.pattern

    cy.get('[data-testid="show-referral-buttons"]').then(buttonsElement => {
      const buttons = ShowReferralUtils.buttons({ currentPath: currentBasePath }, referral, statusTransitions)

      cy.wrap(buttonsElement).within(() => {
        buttons.forEach((button, buttonIndex) => {
          cy.get('.govuk-button')
            .eq(buttonIndex)
            .then(buttonElement => {
              if (button.text) {
                const { actual, expected } = Helpers.parseHtml(buttonElement, button.text)
                expect(actual).to.equal(expected)
              }

              cy.wrap(buttonElement).should('have.attr', 'href', button.href)
            })
        })
      })
    })
  }

  shouldContainShowReferralSubHeading(subHeading: string): void {
    cy.get('[data-testid="show-referral-sub-heading"]').should('have.text', subHeading)
  }

  shouldContainShowReferralSubNavigation(
    currentPath: string,
    currentSection: 'referral' | 'risksAndNeeds' | 'statusHistory',
    referralId: Referral['id'],
  ): void {
    const currentBasePath = currentPath.startsWith(assessPathBase.pattern)
      ? assessPathBase.pattern
      : referPathBase.pattern
    const navigationItems = ShowReferralUtils.subNavigationItems(currentBasePath, currentSection, referralId)

    navigationItems.forEach((navigationItem, navigationItemIndex) => {
      const { href, text } = navigationItem

      cy.get('.moj-sub-navigation__item')
        .eq(navigationItemIndex)
        .within(subNavigationItemElement => {
          const { actual, expected } = Helpers.parseHtml(subNavigationItemElement, text)
          expect(actual).to.equal(expected)

          cy.get('.moj-sub-navigation__link').then(subNavigationItemLinkElement => {
            cy.wrap(subNavigationItemLinkElement).should('have.attr', 'href', href)

            if (currentSection === 'referral' && text === 'Referral details') {
              cy.get('a').should('have.attr', 'aria-current', 'page')
            } else if (currentSection === 'risksAndNeeds' && text === 'Risks and needs') {
              cy.get('a').should('have.attr', 'aria-current', 'page')
            } else if (currentSection === 'statusHistory' && text === 'Status history') {
              cy.get('a').should('have.attr', 'aria-current', 'page')
            } else {
              cy.get('a').should('not.have.attr', 'aria-current', 'page')
            }
          })
        })
    })
  }

  shouldContainSubmissionSummaryList(
    referralSubmissionDate: Referral['submittedOn'],
    referrerName: User['name'],
    referrerEmail: CourseOffering['contactEmail'],
    prisonOffenderManager: Referral['primaryPrisonOffenderManager'],
  ): void {
    cy.get('[data-testid="submission-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        ShowReferralUtils.submissionSummaryListRows(
          referralSubmissionDate,
          referrerName,
          referrerEmail,
          prisonOffenderManager,
        ),
        summaryListElement,
      )
    })
  }

  shouldContainSubmittedReferralSideNavigation(currentPath: string, referralId: Referral['id']): void {
    const currentBasePath = currentPath.startsWith(assessPathBase.pattern)
      ? assessPathBase.pattern
      : referPathBase.pattern
    const navigationItems = ShowReferralUtils.viewReferralNavigationItems(currentBasePath, referralId)

    cy.get('.moj-side-navigation__item').each((navigationItemElement, navigationItemElementIndex) => {
      const { href, text } = navigationItems[navigationItemElementIndex]

      const { actual, expected } = Helpers.parseHtml(navigationItemElement, text)
      expect(actual).to.equal(expected)

      cy.wrap(navigationItemElement).within(() => {
        cy.get('a').should('have.attr', 'href', href)

        if (currentPath === href.replace('#content', '')) {
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
      cy.get('.govuk-summary-card__title').should('contain.text', title)

      actions.forEach((action, actionIndex) => {
        cy.get('.govuk-summary-card__actions .govuk-link')
          .eq(actionIndex)
          .then(actionElement => {
            let { text } = action

            if (action.visuallyHiddenText) {
              const visuallyHiddenText = ` ${action.visuallyHiddenText} (${title})`
              text += visuallyHiddenText

              cy.wrap(actionElement).within(() => {
                cy.get('.govuk-visually-hidden').should('have.text', visuallyHiddenText)
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

  shouldContainText(content: string): void {
    cy.get('p.govuk-body').contains(content).should('exist')
  }

  shouldContainTextArea(id: string, label: string): void {
    cy.get(`.govuk-label[for="${id}"]`).then(labelElement => {
      const { actual, expected } = Helpers.parseHtml(labelElement, label)
      expect(actual).to.equal(expected)
    })

    cy.get(`.govuk-textarea[id="${id}"]`).should('exist')
  }

  shouldContainTextInput(id: string, label: string): void {
    cy.get(`.govuk-label[for="${id}"]`).then(labelElement => {
      const { actual, expected } = Helpers.parseHtml(labelElement, label)
      expect(actual).to.equal(expected)
    })
    cy.get(`.govuk-input[id="${id}"]`).should('exist')
  }

  shouldContainTimelineItems(items: Array<MojTimelineItem>, element: JQuery<HTMLElement>): void {
    cy.wrap(element).within(() => {
      items.forEach((item, itemIndex) => {
        cy.get('.moj-timeline__item')
          .eq(itemIndex)
          .within(timelineItemElement => {
            cy.wrap(timelineItemElement).within(() => {
              if ('text' in item.label) {
                cy.get('.moj-timeline__title').should('have.text', item.label.text)
              }
              cy.get('.moj-timeline__byline').should('have.text', `by ${item.byline.text}`)
              cy.get('.moj-timeline__date').should(
                'contain.text',
                mojFrontendFilters().mojDate(item.datetime.timestamp, item.datetime.type),
              )
              cy.get('.moj-timeline__description').then(htmlElement => {
                if ('html' in item) {
                  const { actual, expected } = Helpers.parseHtml(htmlElement, item.html)
                  expect(actual).to.equal(expected)
                }
              })
            })
          })
      })
    })
  }

  shouldContainWarningText(text: GovukFrontendWarningText['text']): void {
    cy.get('.govuk-warning-text__text').then(warningElement => {
      const { actual, expected } = Helpers.parseHtml(warningElement, `Warning ${text}`)
      expect(actual).to.equal(expected)
    })
  }

  shouldHaveCourses(courses: Array<Course>) {
    cy.get('div[role=listitem]').each((courseElement, courseElementIndex) => {
      cy.wrap(courseElement).within(() => {
        const course = CourseUtils.presentCourse(courses[courseElementIndex])

        const isBuildingChoicesCourse = course.name.startsWith('Building Choices')
        const courseLinkPath = isBuildingChoicesCourse ? findPaths.buildingChoices.form.show : findPaths.show

        cy.get('.govuk-link').should('have.attr', 'href', courseLinkPath({ courseId: course.id }))
        cy.get('.govuk-heading-m .govuk-link').should('have.text', course.displayName)

        if (!isBuildingChoicesCourse) {
          cy.get('.govuk-tag').then(tagElement => {
            this.shouldContainTag(course.audienceTag, tagElement)
          })
          cy.get('p:nth-of-type(2)').should('have.text', course.description)
        } else {
          cy.get('p:nth-of-type(1)').should('have.text', course.description)
        }

        cy.get('.govuk-summary-list').then(summaryListElement => {
          this.shouldContainSummaryListRows(course.prerequisiteSummaryListRows, summaryListElement)
        })
      })
    })
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

  shouldHaveSelectValue(testId: string, value: string): void {
    cy.get(`[data-testid="${testId}"]`).should('have.value', value)
  }

  shouldNotContainButtonLink(): void {
    cy.get('.govuk-button').should('not.exist')
  }

  shouldNotContainFilters(): void {
    cy.get('.filters').should('not.exist')
  }

  shouldNotContainHomeLink(): void {
    cy.get('[data-testid=home-link]').should('not.exist')
  }

  shouldNotContainLink(href: string): void {
    cy.get(`[href="${href}"]`).should('not.exist')
  }

  shouldNotContainNavigation(): void {
    cy.get('.moj-primary-navigation').should('not.exist')
  }

  shouldNotContainPagination() {
    cy.get('.govuk-pagination').should('not.exist')
  }

  shouldNotContainTable(): void {
    cy.get('.govuk-table').should('not.exist')
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
    let expectedTitle = ''

    if (this.pageTitleOverride) {
      expectedTitle = this.pageTitleOverride
    } else {
      if (this.subHeading) {
        expectedTitle += `${this.subHeading} - `
      }
      expectedTitle += this.pageHeading
    }

    if (this.hideTitleServiceName) {
      expectedTitle += ' - DPS'
    } else {
      expectedTitle += ' - Accredited Programmes - DPS'
    }

    cy.title().should('equal', expectedTitle)
  }
}
