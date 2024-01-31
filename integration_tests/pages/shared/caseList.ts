import { assessPaths, referPaths } from '../../../server/paths'
import { CaseListUtils, CourseUtils, StringUtils } from '../../../server/utils'
import Helpers from '../../support/helpers'
import Page from '../page'
import type { Course, ReferralSummary } from '@accredited-programmes/api'
import type { CaseListColumnHeader, ReferralStatusGroup } from '@accredited-programmes/ui'

export default class CaseListPage extends Page {
  columnHeaders: Array<CaseListColumnHeader>

  referralSummaries: Array<ReferralSummary>

  constructor(args: {
    columnHeaders: Array<CaseListColumnHeader>
    referralSummaries: Array<ReferralSummary>
    course?: Course
  }) {
    const { columnHeaders, course, referralSummaries } = args

    super(course ? CourseUtils.courseNameWithAlternateName(course) : 'My referrals')

    this.columnHeaders = columnHeaders
    this.referralSummaries = referralSummaries
  }

  shouldContainCourseNavigation(currentPath: string, courses: Array<Course>): void {
    const navigationItems = courses
      .sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
      .map(course => {
        return {
          href: assessPaths.caseList.show({ courseName: StringUtils.convertToUrlSlug(course.name) }),
          text: `${course.name} referrals`,
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

  shouldContainStatusNavigation(currentReferralStatusGroup: ReferralStatusGroup) {
    const referralStatusGroups: Array<ReferralStatusGroup> = ['open', 'draft']

    referralStatusGroups.forEach((referralStatusGroup, referralStatusGroupIndex) => {
      cy.get('.moj-sub-navigation__item')
        .eq(referralStatusGroupIndex)
        .within(subNavigationItemElement => {
          const { actual, expected } = Helpers.parseHtml(
            subNavigationItemElement,
            `${StringUtils.properCase(referralStatusGroup)} referrals`,
          )
          expect(actual).to.equal(expected)

          cy.get('.moj-sub-navigation__link').then(subNavigationItemLinkElement => {
            cy.wrap(subNavigationItemLinkElement).should(
              'have.attr',
              'href',
              referPaths.caseList.show({ referralStatusGroup }),
            )

            if (currentReferralStatusGroup === referralStatusGroup) {
              cy.wrap(subNavigationItemLinkElement).should('have.attr', 'aria-current', 'page')
            }
          })
        })
    })
  }

  shouldContainTableOfReferralSummaries(paths: typeof assessPaths | typeof referPaths) {
    this.columnHeaders.forEach((columnHeader, columnHeaderIndex) => {
      cy.get('.govuk-table__header').eq(columnHeaderIndex).should('have.text', columnHeader)
    })

    cy.get('.govuk-table__body').within(() => {
      cy.get('.govuk-table__row').each((tableRowElement, tableRowElementIndex) => {
        const summary = this.referralSummaries[tableRowElementIndex]

        cy.wrap(tableRowElement).within(() => {
          this.columnHeaders.forEach((column, columnIndex) => {
            cy.get('.govuk-table__cell')
              .eq(columnIndex)
              .then(tableCellElement => {
                switch (column) {
                  case 'Conditional release date':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Conditional release date'),
                    )
                    break
                  case 'Date referred':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Date referred'),
                    )
                    break
                  case 'Earliest release date':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Earliest release date'),
                    )
                    break
                  case 'Name / Prison number':
                    cy.wrap(tableCellElement).should(
                      'have.html',
                      CaseListUtils.tableRowContent(summary, 'Name / Prison number', paths),
                    )
                    break
                  case 'Parole eligibility date':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Parole eligibility date'),
                    )
                    break
                  case 'Programme location':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Programme location'),
                    )
                    break
                  case 'Programme name':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Programme name'),
                    )
                    break
                  case 'Programme strand':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Programme strand'),
                    )
                    break
                  case 'Referral status':
                    cy.wrap(tableCellElement).should(
                      'have.html',
                      CaseListUtils.tableRowContent(summary, 'Referral status'),
                    )
                    break
                  case 'Release date type':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Release date type'),
                    )
                    break
                  case 'Tariff end date':
                    cy.wrap(tableCellElement).should(
                      'have.text',
                      CaseListUtils.tableRowContent(summary, 'Tariff end date'),
                    )
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
    filteredReferralSummaries: Array<ReferralSummary>,
  ) {
    cy.task('stubFindReferralSummaries', {
      organisationId: 'MRI',
      queryParameters: {
        audience: { equalTo: CaseListUtils.uiToApiAudienceQueryParam(programmeStrandSelectedValue) },
        status: { equalTo: CaseListUtils.uiToApiStatusQueryParam(referralStatusSelectedValue) },
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
