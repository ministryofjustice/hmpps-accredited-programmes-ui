import { findPaths } from '../../../../server/paths'
import Page from '../../page'
import type { CourseOffering, Person } from '@accredited-programmes/models'
import type { Course } from '@accredited-programmes-api'

export default class NewReferralConfirmPersonPage extends Page {
  courseOffering: CourseOffering

  person: Person

  constructor(args: { course: Course; courseOffering: CourseOffering; person: Person }) {
    const { courseOffering, person } = args

    super(`Confirm ${person.name}'s details`, {
      pageTitleOverride: "Confirm person's details",
    })

    this.courseOffering = courseOffering
    this.person = person
  }

  confirmPerson() {
    this.shouldContainButton('Continue').click()
  }

  shouldContainContinueButton() {
    this.shouldContainButton('Continue')
  }

  shouldContainDifferentIdentifierLink() {
    this.shouldContainLink('Enter a different identifier', findPaths.pniFind.personSearch({}))
  }

  shouldHavePersonInformation() {
    this.shouldContainPersonSummaryList(this.person)

    this.shouldContainWarningText(
      'If this information is out of date or incorrect, you must update the information in NOMIS.',
    )
  }
}
