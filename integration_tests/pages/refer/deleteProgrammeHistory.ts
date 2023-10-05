import Page from '../page'
import type { CourseParticipationWithName, Person, Referral } from '@accredited-programmes/models'

export default class DeleteProgrammeHistoryPage extends Page {
  participation: CourseParticipationWithName

  person: Person

  referral: Referral

  constructor(args: { participationWithName: CourseParticipationWithName; person: Person; referral: Referral }) {
    super('Remove programme')

    const { participationWithName, person, referral } = args
    this.participation = participationWithName
    this.person = person
    this.referral = referral
  }
}
