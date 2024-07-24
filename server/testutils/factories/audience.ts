import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import type { Audience } from '@accredited-programmes/models'

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
  name: courseAudienceFactory.build(),
}))
