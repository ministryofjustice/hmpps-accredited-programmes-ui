import ReferralUtils from './referralUtils'
import { referralStatusRefDataFactory } from '../../testutils/factories'
import type { ReferralStatusCategory } from '@accredited-programmes/models'

describe('ReferralUtils', () => {
  describe('createReasonsFieldset', () => {
    it('creates an array of fieldsets with a legend and radios property', () => {
      const groupedOptions = {
        W_ADMIN: [
          { code: 'A', description: 'Category A', referralCategoryCode: 'W_ADMIN' },
          { code: 'B', description: 'Category B', referralCategoryCode: 'W_ADMIN' },
        ],
      }
      expect(ReferralUtils.createReasonsFieldset(groupedOptions)).toEqual([
        {
          legend: {
            text: 'Administrative error',
          },
          radios: [
            { checked: false, text: 'Category A', value: 'A' },
            { checked: false, text: 'Category B', value: 'B' },
          ],
          testId: 'W_ADMIN-reason-options',
        },
      ])
    })

    describe('when a selected item is provided', () => {
      it('should mark the corresponding radio item as checked', () => {
        const groupedOptions = {
          W_ADMIN: [
            { code: 'A', description: 'Category A', referralCategoryCode: 'W_ADMIN' },
            { code: 'B', description: 'Category B', referralCategoryCode: 'W_ADMIN' },
          ],
        }
        expect(ReferralUtils.createReasonsFieldset(groupedOptions, 'B')).toEqual([
          {
            legend: {
              text: 'Administrative error',
            },
            radios: [
              { checked: false, text: 'Category A', value: 'A' },
              { checked: true, text: 'Category B', value: 'B' },
            ],
            testId: 'W_ADMIN-reason-options',
          },
        ])
      })
    })
  })

  describe('groupReasonsByCategory', () => {
    it('groups an array of items by a `referralCategoryCode` property', () => {
      const items = [
        { code: 'A', description: 'Category A', referralCategoryCode: 'WITHDRAWN' },
        { code: 'B', description: 'Category B', referralCategoryCode: 'WITHDRAWN' },
      ]
      expect(ReferralUtils.groupReasonsByCategory(items)).toEqual({
        WITHDRAWN: items,
      })
    })
  })

  describe('statusOptionsToRadioItems', () => {
    it('formats an array of options with a `code` and `description` in the appropriate format for passing to a GOV.UK radios Nunjucks macro', () => {
      const statusCategories: Array<ReferralStatusCategory> = [
        { code: 'A', description: 'Category A', referralStatusCode: 'WITHDRAWN' },
        { code: 'B', description: 'Category B', referralStatusCode: 'WITHDRAWN' },
      ]
      expect(ReferralUtils.statusOptionsToRadioItems(statusCategories)).toEqual([
        { checked: false, text: 'Category A', value: 'A' },
        { checked: false, text: 'Category B', value: 'B' },
      ])
    })

    describe('when a selected item is provided', () => {
      it('should mark the corresponding radio item as checked', () => {
        const statusCategories: Array<ReferralStatusCategory> = [
          { code: 'A', description: 'Category A', referralStatusCode: 'WITHDRAWN' },
          { code: 'B', description: 'Category B', referralStatusCode: 'WITHDRAWN' },
        ]
        expect(ReferralUtils.statusOptionsToRadioItems(statusCategories, 'B')).toEqual([
          { checked: false, text: 'Category A', value: 'A' },
          { checked: true, text: 'Category B', value: 'B' },
        ])
      })
    })

    describe('when the provided array includes an option with the description "Other"', () => {
      it('should include a divider before the "Other" item', () => {
        const statusCategories: Array<ReferralStatusCategory> = [
          { code: 'A', description: 'Category A', referralStatusCode: 'WITHDRAWN' },
          { code: 'B', description: 'Category B', referralStatusCode: 'WITHDRAWN' },
          { code: 'OTHER', description: 'Other', referralStatusCode: 'WITHDRAWN' },
        ]
        expect(ReferralUtils.statusOptionsToRadioItems(statusCategories)).toEqual([
          { checked: false, text: 'Category A', value: 'A' },
          { checked: false, text: 'Category B', value: 'B' },
          { divider: 'or', value: '' },
          { checked: false, text: 'Other', value: 'OTHER' },
        ])
      })
    })

    describe('when the provided array includes an option with a `hintText`', () => {
      it('should include a hint for the corresponding radio item', () => {
        const hintText = 'Some hint text'
        const referralStatusTransitions = [
          referralStatusRefDataFactory.build(),
          referralStatusRefDataFactory.build({ hintText }),
        ]

        expect(ReferralUtils.statusOptionsToRadioItems(referralStatusTransitions)).toEqual([
          { checked: false, text: referralStatusTransitions[0].description, value: referralStatusTransitions[0].code },
          {
            checked: false,
            hint: { text: hintText },
            text: referralStatusTransitions[1].description,
            value: referralStatusTransitions[1].code,
          },
        ])
      })
    })
  })
})
