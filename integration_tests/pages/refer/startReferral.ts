import { referPaths } from '../../../server/paths'
import { CourseUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'

export default class StartReferralPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  constructor(args: { course: Course; courseOffering: CourseOffering; organisation: Organisation }) {
    super('Make a referral')

    const { course, courseOffering, organisation } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
  }

  shouldContainStartButtonLink() {
    this.shouldContainButtonLink('Start now', referPaths.new({ courseOfferingId: this.courseOffering.id }))
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
}
