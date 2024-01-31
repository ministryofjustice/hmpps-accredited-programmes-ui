import HealthUtils from './healthUtils'
import type { Health } from '@accredited-programmes/api'

describe('HealthUtils', () => {
  describe('healthSummaryListRows', () => {
    it('formats the health data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const health: Health = {
        anyHealthConditions: true,
        description: 'Some health conditions',
      }

      expect(HealthUtils.healthSummaryListRows(health)).toEqual([
        {
          key: { text: 'General health - any physical or mental health conditions? (optional)' },
          value: { html: 'Yes<br><br>Some health conditions' },
        },
      ])
    })

    describe('when there are no health conditions', () => {
      it('formats the health data in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
        const health: Health = {
          anyHealthConditions: false,
          description: undefined,
        }

        expect(HealthUtils.healthSummaryListRows(health)).toEqual([
          {
            key: { text: 'General health - any physical or mental health conditions? (optional)' },
            value: { html: 'No' },
          },
        ])
      })
    })
  })
})
