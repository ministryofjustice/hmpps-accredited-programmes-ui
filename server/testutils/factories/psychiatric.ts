import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Psychiatric } from '@accredited-programmes/models'

export default Factory.define<Psychiatric>(() => {
  const problemOptions = ['0-No problems', '1-Some problems']

  return {
    currPsychologicalProblems: FactoryHelpers.optionalArrayElement(problemOptions),
    description: FactoryHelpers.optionalArrayElement(problemOptions),
    difficultiesCoping: FactoryHelpers.optionalArrayElement(problemOptions),
    selfHarmSuicidal: FactoryHelpers.optionalArrayElement(['No-0', 'Yes-1']),
  }
})
