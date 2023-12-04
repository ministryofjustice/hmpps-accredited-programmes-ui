import { assessPaths } from '../../../server/paths'
import { CaseListUtils, CourseUtils, DateUtils, StringUtils } from '../../../server/utils'
import Helpers from '../../support/helpers'
import Page from '../page'
import type { Course, ReferralSummary } from '@accredited-programmes/models'

export default class CaseListPage extends Page {
  referralSummaries: Array<ReferralSummary>

  constructor(args: { referralSummaries: Array<ReferralSummary>; course?: Course }) {
    const { course, referralSummaries } = args

    super(course ? CourseUtils.courseNameWithAlternateName(course) : 'My referrals')

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
          cy.get('.govuk-table__cell:nth-of-type(5)').should('have.html', CaseListUtils.statusTagHtml(summary.status))
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
