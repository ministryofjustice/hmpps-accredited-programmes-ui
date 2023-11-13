import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import offenceHistoryDetail from './offenceHistoryDetail'
import type { InmateDetail } from '@prison-api'

export default Factory.define<Partial<InmateDetail>>(() => {
  const offenceHistory = [offenceHistoryDetail.build({ mostSerious: true }), offenceHistoryDetail.build()]

  return {
    offenceHistory: FactoryHelpers.optionalArrayElement([offenceHistory]),
    offenderNo: FactoryHelpers.optionalArrayElement(faker.string.alphanumeric({ casing: 'upper', length: 7 })),
  }
})
