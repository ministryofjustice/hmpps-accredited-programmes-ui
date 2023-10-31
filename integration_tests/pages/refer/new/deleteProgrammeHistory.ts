import Page from '../../page'
import type { CourseParticipation, Person, Referral } from '@accredited-programmes/models'

export default class NewReferralDeleteProgrammeHistoryPage extends Page {
  participation: CourseParticipation

  person: Person

  referral: Referral

  constructor(args: { participation: CourseParticipation; person: Person; referral: Referral }) {
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
