import Page from '../page'
import type { Person } from '@accredited-programmes/models'

export default class ShowPersonPage extends Page {
  person: Person

  constructor(args: { person: Person }) {
    const { person } = args
    super(`${person.name}'s details`, { customPageTitleEnd: 'Personal details' })

    this.person = person
  }
}
