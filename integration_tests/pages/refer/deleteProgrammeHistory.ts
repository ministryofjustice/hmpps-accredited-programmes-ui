import Page from '../page'
import type { Person, Referral } from '@accredited-programmes/models'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'

export default class DeleteProgrammeHistoryPage extends Page {
  participation: CourseParticipationPresenter

  person: Person

  referral: Referral

  constructor(args: { participation: CourseParticipationPresenter; person: Person; referral: Referral }) {
    super('Remove programme')

    const { participation, person, referral } = args
    this.participation = participation
    this.person = person
    this.referral = referral
  }

  confirm() {
    cy.task('stubParticipationsByPerson', { courseParticipations: [], prisonNumber: this.person.prisonNumber })
    this.shouldContainButton('Confirm').click()
  }
}
