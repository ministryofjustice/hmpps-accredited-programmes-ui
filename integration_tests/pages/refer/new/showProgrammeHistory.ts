import Page from '../../page'
import type { Person } from '@accredited-programmes/models'
import type { CourseParticipation, Referral } from '@accredited-programmes-api'

export default class NewReferralShowProgrammeHistoryPage extends Page {
  participation: CourseParticipation

  person: Person

  referral: Referral

  constructor(args: { participation: CourseParticipation; person: Person; referral: Referral }) {
    super('Programme history details', {
      hideTitleServiceName: true,
    })

    const { participation, person, referral } = args
    this.participation = participation
    this.person = person
    this.referral = referral
  }
}
