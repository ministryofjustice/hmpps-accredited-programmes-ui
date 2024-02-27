import ReferralUtils from './referralUtils'
import type { ReferralStatusCategory } from '@accredited-programmes/models'

describe('ReferralUtils', () => {
  describe('statusCategoriesToRadioItems', () => {
    it('formats the referral status categories in the appropriate format for passing to a GOV.UK radios Nunjucks macro', () => {
      const statusCategories: Array<ReferralStatusCategory> = [
        { code: 'A', description: 'Category A', referralStatusCode: 'WITHDRAWN' },
        { code: 'B', description: 'Category B', referralStatusCode: 'WITHDRAWN' },
      ]
      expect(ReferralUtils.statusCategoriesToRadioItems(statusCategories)).toEqual([
        { checked: false, text: 'Category A', value: 'A' },
        { checked: false, text: 'Category B', value: 'B' },
      ])
    })

    describe('when a selected status category is provided', () => {
      it('should mark the corresponding radio item as checked', () => {
        const statusCategories: Array<ReferralStatusCategory> = [
          { code: 'A', description: 'Category A', referralStatusCode: 'WITHDRAWN' },
          { code: 'B', description: 'Category B', referralStatusCode: 'WITHDRAWN' },
        ]
        expect(ReferralUtils.statusCategoriesToRadioItems(statusCategories, 'B')).toEqual([
          { checked: false, text: 'Category A', value: 'A' },
          { checked: true, text: 'Category B', value: 'B' },
        ])
      })
    })

    describe('when the categories include a description with the value "Other"', () => {
      it('should include a divider for the "Other" category', () => {
        const statusCategories: Array<ReferralStatusCategory> = [
          { code: 'A', description: 'Category A', referralStatusCode: 'WITHDRAWN' },
          { code: 'B', description: 'Category B', referralStatusCode: 'WITHDRAWN' },
          { code: 'OTHER', description: 'Other', referralStatusCode: 'WITHDRAWN' },
        ]
        expect(ReferralUtils.statusCategoriesToRadioItems(statusCategories)).toEqual([
          { checked: false, text: 'Category A', value: 'A' },
          { checked: false, text: 'Category B', value: 'B' },
          { divider: 'or', value: '' },
          { checked: false, text: 'Other', value: 'OTHER' },
        ])
      })
    })
  })
})
