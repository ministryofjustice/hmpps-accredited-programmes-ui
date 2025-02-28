import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Audience } from '@accredited-programmes-api'

export default Factory.define<Audience>(() => ({
  id: faker.string.uuid(), // eslint-disable-next-line sort-keys
  colour: faker.helpers.arrayElement([
    'blue',
    'green',
    'grey',
    'light-blue',
    'orange',
    'pink',
    'purple',
    'red',
    'turquoise',
    'yellow',
  ]),
  name: faker.helpers.arrayElement([
    'All offences',
    'Extremism offence',
    'Gang offence',
    'General offence',
    'General violence offence',
    'Intimate partner violence offence',
    'Sexual offence',
  ]),
}))
