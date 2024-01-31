import { referPaths } from '../../../../server/paths'
import Page from '../../page'
import type { Course, CourseOffering } from '@accredited-programmes/api'
import type { Person } from '@accredited-programmes/ui'

export default class NewReferralConfirmPersonPage extends Page {
  courseOffering: CourseOffering

  person: Person

  constructor(args: { course: Course; courseOffering: CourseOffering; person: Person }) {
    const { courseOffering, person } = args

    super(`Confirm ${person.name}'s details`, { customPageTitleEnd: 'Confirm personal details' })

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
    this.shouldContainLink(
      'Enter a different identifier',
      referPaths.new.new({ courseOfferingId: this.courseOffering.id }),
    )
  }

  shouldHavePersonInformation() {
    this.shouldContainPersonSummaryList(this.person)

    this.shouldContainWarningText(
      'If this information is out of date or incorrect, you must update the information in NOMIS.',
    )
  }
}
