import ReferenceDataUtils from './referenceDataUtils'
import type { SexualOffenceDetails } from '@accredited-programmes-api'

describe('ReferenceDataUtils', () => {
  describe('createSexualOffenceDetailsFieldset', () => {
    it('creates fieldset with checkboxes grouped by category', () => {
      const groupedOptions: Record<string, Array<SexualOffenceDetails>> = {
        'Category 1': [
          {
            categoryCode: 'CAT1',
            categoryDescription: 'Category 1',
            description: 'Option 1',
            hintText: 'Hint 1',
            id: 'ABC-123',
            score: 1,
          },
          {
            categoryCode: 'CAT1',
            categoryDescription: 'Category 1',
            description: 'Option 2',
            hintText: 'Hint 2',
            id: 'ABC-456',
            score: 2,
          },
        ],
        'Category 2': [
          {
            categoryCode: 'CAT2',
            categoryDescription: 'Category 2',
            description: 'Option 3',
            hintText: 'Hint 3',
            id: 'ABC-789',
            score: 3,
          },
        ],
      }
      const selectedOptions = ['ABC-456::2']

      expect(ReferenceDataUtils.createSexualOffenceDetailsFieldset(groupedOptions, selectedOptions)).toEqual([
        {
          checkboxes: [
            {
              checked: false,
              hint: { text: 'Hint 1' },
              text: 'Option 1',
              value: 'ABC-123::1',
            },
            {
              checked: true,
              hint: { text: 'Hint 2' },
              text: 'Option 2',
              value: 'ABC-456::2',
            },
          ],
          legend: { text: 'Category 1' },
        },
        {
          checkboxes: [
            {
              checked: false,
              hint: { text: 'Hint 3' },
              text: 'Option 3',
              value: 'ABC-789::3',
            },
          ],
          legend: { text: 'Category 2' },
        },
      ])
    })
  })

  describe('groupOptionsByKey', () => {
    it('groups items by specified key', () => {
      const items = [
        { category: 'A', id: '1', name: 'Item 1' },
        { category: 'B', id: '2', name: 'Item 2' },
        { category: 'A', id: '3', name: 'Item 3' },
      ]

      const grouped = ReferenceDataUtils.groupOptionsByKey(items, 'category')

      expect(grouped).toEqual({
        A: [
          { category: 'A', id: '1', name: 'Item 1' },
          { category: 'A', id: '3', name: 'Item 3' },
        ],
        B: [{ category: 'B', id: '2', name: 'Item 2' }],
      })
    })
  })
})
