import { referPaths } from '../../../../server/paths'
import { CourseUtils } from '../../../../server/utils'
import Page from '../../page'
import type { CourseOffering, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'

export default class NewReferralStartPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  prisonNumber: string

  constructor(args: {
    course: Course
    courseOffering: CourseOffering
    organisation: Organisation
    prisonNumber: string
  }) {
    super('Make a referral', {
      pageTitleOverride: 'Start referral',
    })

    const { course, courseOffering, organisation, prisonNumber } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
    this.prisonNumber = prisonNumber
  }

  shouldContainStartButtonLink() {
    return this.shouldContainButtonLink(
      'Start now',
      referPaths.new.people.show({ courseOfferingId: this.courseOffering.id, prisonNumber: this.prisonNumber }),
    )
  }

  shouldHaveProcessInformation() {
    cy.get('h2:nth-of-type(2)').should('have.text', "What you'll need to do")

    cy.get('[data-testid="pre-list-paragraph"]').should('have.text', 'When completing the referral:')

    const listItemsText = [
      "review this person's information and confirm that it's accurate",
      "review or add this person's history of Accredited Programmes",
      'provide any supporting information for this referral',
    ]

    cy.get('.govuk-list li').each((listItem, listItemIndex) => {
      cy.wrap(listItem).should('have.text', listItemsText[listItemIndex])
    })
  }
}
