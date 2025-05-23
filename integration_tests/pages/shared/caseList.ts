import { referralStatusGroups } from '../../../server/@types/models/Referral'
import { assessPaths, referPaths } from '../../../server/paths'
import { CaseListUtils, PathUtils, StringUtils } from '../../../server/utils'
import Helpers from '../../support/helpers'
import Page from '../page'
import type { ReferralStatusGroup, ReferralView } from '@accredited-programmes/models'
import type { CaseListColumnHeader, QueryParam } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'

export default class CaseListPage extends Page {
  columnHeaders: Array<CaseListColumnHeader>

  referralViews: Array<ReferralView>

  constructor(args: {
    columnHeaders: Array<CaseListColumnHeader>
    referralViews: Array<ReferralView>
    course?: Course
    referralStatusGroup?: string
  }) {
    const { columnHeaders, course, referralStatusGroup, referralViews } = args

    const status = referralStatusGroup || 'open'
    const title = course ? `Manage ${status} programme team referrals: ${course.name}` : `My ${status} referrals`

    super(course ? course.name : 'My referrals', {
      pageTitleOverride: title,
    })

    this.columnHeaders = columnHeaders
    this.referralViews = referralViews
  }

  searchFor(searchTerm: string) {
    cy.get('[data-testid="search-input"]').type(searchTerm)
    cy.get('form').submit()
  }

  shouldClearFilters() {
    this.shouldContainLink('Clear filters', 'open').click()
  }

  shouldContainCourseNavigation(currentPath: string, courses: Array<Course>): void {
    const navigationItems = courses
      .sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
      .map(course => {
        return {
          href: assessPaths.caseList.show({
            courseId: course.id,
            referralStatusGroup: 'open',
          }),
          text: course.name,
        }
      })

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

  shouldContainSearchInput(searchTerm?: string) {
    cy.get('[data-testid="search-input"]').should('have.value', searchTerm || '')
  }

  shouldContainStatusNavigation(
    currentReferralStatusGroup: ReferralStatusGroup,
    courseId?: Course['id'],
    numberOfResults?: Partial<Record<ReferralStatusGroup, number>>,
    queryParams: Array<QueryParam> = [],
  ) {
    referralStatusGroups
      .filter(statusGroup => (courseId ? statusGroup !== 'draft' : true))
      .forEach((referralStatusGroup, referralStatusGroupIndex) => {
        cy.get('.moj-sub-navigation__item')
          .eq(referralStatusGroupIndex)
          .within(subNavigationItemElement => {
            const { actual, expected } = Helpers.parseHtml(
              subNavigationItemElement,
              `${StringUtils.properCase(referralStatusGroup)} referrals${numberOfResults ? ` (${numberOfResults[referralStatusGroup]})` : ''}`,
            )
            expect(actual).to.equal(expected)

            cy.get('.moj-sub-navigation__link').then(subNavigationItemLinkElement => {
              cy.wrap(subNavigationItemLinkElement).should(
                'have.attr',
                'href',
                courseId
                  ? PathUtils.pathWithQuery(assessPaths.caseList.show({ courseId, referralStatusGroup }), queryParams)
                  : PathUtils.pathWithQuery(referPaths.caseList.show({ referralStatusGroup }), queryParams),
              )

              if (currentReferralStatusGroup === referralStatusGroup) {
                cy.wrap(subNavigationItemLinkElement).should('have.attr', 'aria-current', 'page')
              }
            })
          })
      })
  }

  shouldContainTableOfReferralViews(paths: typeof assessPaths | typeof referPaths) {
    this.columnHeaders.forEach((columnHeader, columnHeaderIndex) => {
      cy.get('.govuk-table__header').eq(columnHeaderIndex).should('have.text', columnHeader)
    })

    cy.get('.govuk-table__body').within(() => {
      cy.get('.govuk-table__row').each((tableRowElement, tableRowElementIndex) => {
        const view = this.referralViews[tableRowElementIndex]

        cy.wrap(tableRowElement).within(() => {
          this.columnHeaders.forEach((column, columnIndex) => {
            cy.get('.govuk-table__cell')
              .eq(columnIndex)
              .then(tableCellElement => {
                switch (column) {
                  case 'Date referred':
                    cy.wrap(tableCellElement).should('have.text', CaseListUtils.tableRowContent(view, 'Date referred'))
                    break
                  case 'Earliest release date':
                    cy.wrap(tableCellElement).should(
                      'have.html',
                      CaseListUtils.tableRowContent(view, 'Earliest release date'),
                    )
                    break
                  case 'Name and prison number':
                    cy.wrap(tableCellElement).should(
                      'have.html',
                      CaseListUtils.tableRowContent(view, 'Name and prison number', paths),
                    )
                    break
                  case 'Programme location':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(view, 'Programme location'),
                    )
                    break
                  case 'Programme name':
                    cy.wrap(tableCellElement).should('have.text', CaseListUtils.tableRowContent(view, 'Programme name'))
                    break
                  case 'Programme strand':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(view, 'Programme strand'),
                    )
                    break
                  case 'Referral status':
                    cy.wrap(tableCellElement).should(
                      'have.html',
                      CaseListUtils.tableRowContent(view, 'Referral status'),
                    )
                    break
                  case 'Sentence type':
                    cy.wrap(tableCellElement).should('have.html', CaseListUtils.tableRowContent(view, 'Sentence type'))
                    break
                  default:
                }
              })
          })
        })
      })
    })
  }

  shouldFilter(
    programmeStrandSelectedValue: string,
    referralStatusSelectedValue: string,
    filteredOpenReferralViews: Array<ReferralView>,
    filteredClosedReferralViews: Array<ReferralView>,
  ) {
    cy.task('stubFindReferralViews', {
      organisationId: 'MRI',
      queryParameters: {
        audience: { equalTo: CaseListUtils.uiToApiAudienceQueryParam(programmeStrandSelectedValue) },
        status: { equalTo: referralStatusSelectedValue },
        statusGroup: { equalTo: 'open' },
      },
      referralViews: filteredOpenReferralViews,
      totalElements: filteredOpenReferralViews.length,
    })
    cy.task('stubFindReferralViews', {
      organisationId: 'MRI',
      queryParameters: {
        audience: { equalTo: CaseListUtils.uiToApiAudienceQueryParam(programmeStrandSelectedValue) },
        status: { equalTo: referralStatusSelectedValue },
        statusGroup: { equalTo: 'closed' },
      },
      referralViews: filteredClosedReferralViews,
      totalElements: filteredClosedReferralViews.length,
    })

    this.selectSelectItem('programme-strand-select', programmeStrandSelectedValue)
    this.selectSelectItem('referral-status-select', referralStatusSelectedValue)
    this.shouldFilterButtonClick()
  }

  shouldFilterButtonClick() {
    this.shouldContainButton('Apply filters').click()
  }

  shouldHaveSelectedFilterValues(programmeStrandSelectedValue: string, referralStatusSelectedValue: string) {
    this.shouldHaveSelectValue('programme-strand-select', programmeStrandSelectedValue)
    this.shouldHaveSelectValue('referral-status-select', referralStatusSelectedValue)
  }
}
