import Page from '../../page'
import type { Person } from '@accredited-programmes/ui'

export default class NewReferralShowPersonPage extends Page {
  person: Person

  constructor(args: { person: Person }) {
    const { person } = args
    super(`${person.name}'s details`, { customPageTitleEnd: 'Personal details' })

    this.person = person
  }
}
