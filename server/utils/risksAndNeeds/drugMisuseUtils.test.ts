import DrugMisuseUtils from './drugMisuseUtils'
import { drugAlcoholDetailFactory } from '../../testutils/factories'

describe('DrugMisuseUtils', () => {
  const drugAlcoholDetail = drugAlcoholDetailFactory.build({
    drug: {
      drugsMajorActivity: 'Mock drugs major activity',
      levelOfUseOfMainDrug: '1 - Some problems',
    },
  })

  describe('summaryListRows', () => {
    it('formats the drug misuse data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(DrugMisuseUtils.summaryListRows(drugAlcoholDetail.drug)).toEqual([
        {
          key: { text: '8.5 - Level of use of main drug' },
          value: { text: drugAlcoholDetail.drug.levelOfUseOfMainDrug },
        },
        {
          key: { text: '8.9 - Using and obtaining drugs a major activity or occupation' },
          value: { text: drugAlcoholDetail.drug.drugsMajorActivity },
        },
      ])
    })
  })
})
