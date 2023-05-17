import { prerequisiteSummaryListRows, programmeListItems } from './programmeUtils'
import { programmeFactory, programmePrerequisiteFactory } from '../testutils/factories'

describe('programmeUtils', () => {
  describe('prerequisiteSummaryListRows', () => {
    it('converts prerequisites into summary list rows', () => {
      const prerequisites = programmePrerequisiteFactory.buildList(3)

      expect(prerequisiteSummaryListRows(prerequisites)).toEqual([
        {
          key: { text: prerequisites[0].key },
          value: { text: prerequisites[0].value },
        },
        {
          key: { text: prerequisites[1].key },
          value: { text: prerequisites[1].value },
        },
        {
          key: { text: prerequisites[2].key },
          value: { text: prerequisites[2].value },
        },
      ])
    })
  })

  describe('programmeListItems', () => {
    it('converts programmes into programme list items (converting the prerequisites)', () => {
      const programmes = programmeFactory.buildList(3)

      expect(programmeListItems(programmes)).toEqual([
        {
          name: programmes[0].name,
          programmeType: programmes[0].programmeType,
          description: programmes[0].description,
          prerequisitesSummaryListRows: prerequisiteSummaryListRows(programmes[0].programmePrerequisites),
        },
        {
          name: programmes[1].name,
          programmeType: programmes[1].programmeType,
          description: programmes[1].description,
          prerequisitesSummaryListRows: prerequisiteSummaryListRows(programmes[1].programmePrerequisites),
        },
        {
          name: programmes[2].name,
          programmeType: programmes[2].programmeType,
          description: programmes[2].description,
          prerequisitesSummaryListRows: prerequisiteSummaryListRows(programmes[2].programmePrerequisites),
        },
      ])
    })
  })
})
