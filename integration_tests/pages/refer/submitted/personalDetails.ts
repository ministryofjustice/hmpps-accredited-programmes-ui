import { CourseUtils, DateUtils, ReferralUtils } from '../../../../server/utils'
import Helpers from '../../../support/helpers'
import Page from '../../page'
import type { Course, Organisation, Referral } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'

export default class SubmittedReferralPersonalDetailsPage extends Page {
  course: CoursePresenter

  organisation: Organisation

  referral: Referral

  constructor(args: { course: Course; organisation: Organisation; referral: Referral }) {
    const { course, organisation, referral } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.course = coursePresenter
    this.organisation = organisation
    this.referral = referral
  }

  shouldContainImportedFromText(): void {
    cy.get('[data-testid="imported-from-text"]').should(
      'contain.text',
      `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
    )
  }

  shouldContainSideNavigation(currentPath: string): void {
    const navigationItems = ReferralUtils.viewReferralNavigationItems('/', this.referral.id)

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
}
