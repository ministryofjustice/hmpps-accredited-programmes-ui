import { courseUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'

export default class ReferralStartPage extends Page {
  course: CoursePresenter

  organisation: Organisation

  constructor(args: { course: Course; organisation: Organisation }) {
    super('Make a referral')

    const { organisation, course } = args
    const coursePresenter = courseUtils.presentCourse(course)
    this.course = coursePresenter
    this.organisation = organisation
  }

  shouldHaveProcessInformation() {
    cy.get('h2:nth-of-type(2)').should('have.text', "What you'll need to do")

    cy.get('p:nth-of-type(2)').should('have.text', 'When completing the referral:')

    const listItemsText = [
      "review this person's information and confirm that it's accurate",
      "update information at the source if it's out of date or inaccurate. For example, in OASys or NOMIS",
      'provide a reason for the referral and any supporting information',
    ]

    cy.get('.govuk-list li').each((listItem, listItemIndex) => {
      cy.wrap(listItem).should('have.text', listItemsText[listItemIndex])
    })
  }

  shouldHaveStartButton() {
    this.shouldContainButtonLink('Start now', '#')
  }
}
