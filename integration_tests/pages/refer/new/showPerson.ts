import Page from '../../page'
import type { Person } from '@accredited-programmes/models'

export default class NewReferralShowPersonPage extends Page {
  person: Person

  constructor(args: { person: Person }) {
    const { person } = args
    super(`${person.name}'s details`, { pageTitleOverride: 'Personal details' })

    this.person = person
  }
}
