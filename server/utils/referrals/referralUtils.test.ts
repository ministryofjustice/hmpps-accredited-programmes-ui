import ReferralUtils from './referralUtils'
import { referralStatusRefDataFactory } from '../../testutils/factories'
import type { ReferralStatusCategory } from '@accredited-programmes/models'
import type { ReferralStatusReason } from '@accredited-programmes-api'

describe('ReferralUtils', () => {
  describe('checkIfOverride', () => {
    it('returns true if the requested intensity is not in the recommended pathway', () => {
      expect(ReferralUtils.checkIfOverride('HIGH_INTENSITY_BC', 'MODERATE')).toEqual(true)
    })

    it('returns false if the requested intensity is in the recommended pathway', () => {
      expect(ReferralUtils.checkIfOverride('HIGH_INTENSITY_BC', 'HIGH_MODERATE')).toEqual(false)
    })

    it('returns true if either parameter is missing', () => {
      expect(ReferralUtils.checkIfOverride(undefined, 'HIGH')).toEqual(true)
      expect(ReferralUtils.checkIfOverride('LOW_INTENSITY', undefined)).toEqual(true)
    })
  })

  describe('createReasonsFieldset', () => {
    it('creates an array of fieldsets with a legend and radios property', () => {
      const groupedOptions: Record<string, Array<ReferralStatusReason>> = {
        AS_INCOMPLETE: [
          {
            categoryDescription: 'Incomplete',
            code: 'A',
            description: 'Category A',
            referralCategoryCode: 'AS_INCOMPLETE',
          },
        ],
        AS_MOTIVATION: [
          {
            categoryDescription: 'Motivational',
            code: 'B',
            description: 'Category B',
            referralCategoryCode: 'AS_MOTIVATION',
          },
        ],
        AS_OPERATIONAL: [
          {
            categoryDescription: 'Operational',
            code: 'C',
            description: 'Category C',
            referralCategoryCode: 'AS_OPERATIONAL',
          },
        ],
        AS_PERSONAL: [
          {
            categoryDescription: 'Personal',
            code: 'D',
            description: 'Category D',
            referralCategoryCode: 'AS_PERSONAL',
          },
        ],
        AS_RISK: [
          { categoryDescription: 'Risk', code: 'E', description: 'Category E', referralCategoryCode: 'AS_RISK' },
        ],
        AS_SENTENCE: [
          {
            categoryDescription: 'Sentence',
            code: 'F',
            description: 'Category F',
            referralCategoryCode: 'AS_SENTENCE',
          },
        ],
        W_ADMIN: [
          { categoryDescription: 'Admin', code: 'G', description: 'Category G', referralCategoryCode: 'W_ADMIN' },
        ],
      }
      expect(ReferralUtils.createReasonsFieldset(groupedOptions)).toEqual([
        {
          legend: {
            text: 'Incomplete assessment',
          },
          radios: [
            {
              checked: false,
              text: 'Category A',
              value: 'A',
            },
          ],
          testId: 'AS_INCOMPLETE-reason-options',
        },
        {
          legend: {
            text: 'Motivation and behaviour',
          },
          radios: [
            {
              checked: false,
              text: 'Category B',
              value: 'B',
            },
          ],
          testId: 'AS_MOTIVATION-reason-options',
        },
        {
          legend: {
            text: 'Operational',
          },
          radios: [
            {
              checked: false,
              text: 'Category C',
              value: 'C',
            },
          ],
          testId: 'AS_OPERATIONAL-reason-options',
        },
        {
          legend: {
            text: 'Personal and health',
          },
          radios: [
            {
              checked: false,
              text: 'Category D',
              value: 'D',
            },
          ],
          testId: 'AS_PERSONAL-reason-options',
        },
        {
          legend: {
            text: 'Risk and need',
          },
          radios: [
            {
              checked: false,
              text: 'Category E',
              value: 'E',
            },
          ],
          testId: 'AS_RISK-reason-options',
        },
        {
          legend: {
            text: 'Sentence type',
          },
          radios: [
            {
              checked: false,
              text: 'Category F',
              value: 'F',
            },
          ],
          testId: 'AS_SENTENCE-reason-options',
        },
        {
          legend: {
            text: 'Administrative error',
          },
          radios: [{ checked: false, text: 'Category G', value: 'G' }],
          testId: 'W_ADMIN-reason-options',
        },
      ])
    })

    describe('when a selected item is provided', () => {
      it('should mark the corresponding radio item as checked', () => {
        const groupedOptions: Record<string, Array<ReferralStatusReason>> = {
          W_ADMIN: [
            { categoryDescription: 'Admin', code: 'A', description: 'Category A', referralCategoryCode: 'W_ADMIN' },
            { categoryDescription: 'Admin', code: 'B', description: 'Category B', referralCategoryCode: 'W_ADMIN' },
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
