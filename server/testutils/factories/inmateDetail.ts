import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import offenceHistoryDetail from './offenceHistoryDetail'
import type { InmateDetail } from '@prison-api'

export default Factory.define<Partial<InmateDetail>>(() => {
  const offenceHistory = [offenceHistoryDetail.build({ mostSerious: true }), offenceHistoryDetail.build()]

  return {
    offenceHistory,
    offenderNo: faker.string.alphanumeric({ casing: 'upper', length: 7 }),
  }
})
