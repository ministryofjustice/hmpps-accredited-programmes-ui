import Page from '../../page'
import type { Person } from '@accredited-programmes/models'
import type { CourseParticipation, Referral } from '@accredited-programmes-api'

export default class NewReferralDeleteProgrammeHistoryPage extends Page {
  participation: CourseParticipation

  person: Person

  referral: Referral

  constructor(args: { participation: CourseParticipation; person: Person; referral: Referral }) {
    super('Remove programme', {
      hideTitleServiceName: true,
      pageTitleOverride: 'Delete Accredited Programme history',
    })

    const { participation, person, referral } = args
    this.participation = participation
    this.person = person
    this.referral = referral
  }

  confirm() {
    cy.task('stubParticipationsByPerson', { courseParticipations: [], prisonNumber: this.person.prisonNumber })
    cy.task('stubParticipationsByReferral', { courseParticipations: [], referralId: this.referral.id })
    this.shouldContainButton('Confirm').click()
  }
}
