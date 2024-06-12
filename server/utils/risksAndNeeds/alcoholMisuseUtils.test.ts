import AlcoholMisuseUtils from './alcoholMisuseUtils'
import { drugAlcoholDetailFactory } from '../../testutils/factories'

describe('DrugMisuseUtils', () => {
  const drugAlcoholDetail = drugAlcoholDetailFactory.build({
    alcohol: {
      alcoholIssuesDetails: 'OPD Automatic screen in as first test',
      alcoholLinkedToHarm: 'No',
      bingeDrinking: '1-Some problems',
      frequencyAndLevel: '1-Some problems',
    },
  })

  describe('summaryListRows', () => {
    it('formats the alcohol misuse data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      expect(AlcoholMisuseUtils.summaryListRows(drugAlcoholDetail.alcohol)).toEqual([
        {
          key: { text: '9.1 - Is current use a problem?' },
          value: {
            html: `${drugAlcoholDetail.alcohol.alcoholLinkedToHarm}<br><br>${drugAlcoholDetail.alcohol.alcoholIssuesDetails}`,
          },
        },
        {
          key: { text: '9.2 - Binge drinking or excessive alcohol use in the last 6 months' },
          value: { text: drugAlcoholDetail.alcohol.bingeDrinking },
        },
        {
          key: { text: '9.3 - Level of alcohol misuse in the past' },
          value: { text: drugAlcoholDetail.alcohol.bingeDrinking },
        },
      ])
    })
  })
})
