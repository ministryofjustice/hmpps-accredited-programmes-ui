import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Caseload } from '@prison-api'

class CaseloadFactory extends Factory<Caseload> {
  active() {
    return this.params({
      currentlyActive: true,
    })
  }

  inactive() {
    return this.params({
      currentlyActive: false,
    })
  }
}

export default CaseloadFactory.define(() => ({
  caseLoadId: faker.string.alpha({ casing: 'upper', length: 3 }),
  caseloadFunction: 'GENERAL' as const,
  currentlyActive: true,
  description: `${faker.location.county()} (HMP & YOI)`,
  type: 'INST' as const,
}))
