import { courseListItems, prerequisiteSummaryListRows } from './courseUtils'
import { courseFactory, coursePrerequisiteFactory } from '../testutils/factories'

describe('courseUtils', () => {
  describe('prerequisiteSummaryListRows', () => {
    it('converts prerequisites into summary list rows', () => {
      const prerequisites = coursePrerequisiteFactory.buildList(3)

      expect(prerequisiteSummaryListRows(prerequisites)).toEqual([
        {
          key: { text: prerequisites[0].name },
          value: { text: prerequisites[0].description },
        },
        {
          key: { text: prerequisites[1].name },
          value: { text: prerequisites[1].description },
        },
        {
          key: { text: prerequisites[2].name },
          value: { text: prerequisites[2].description },
        },
      ])
    })
  })

  describe('courseListItems', () => {
    it('converts courses into course list items (converting the prerequisites)', () => {
      const courses = courseFactory.buildList(3)

      expect(courseListItems(courses)).toEqual([
        {
          name: courses[0].name,
          type: courses[0].type,
          description: courses[0].description,
          prerequisitesSummaryListRows: prerequisiteSummaryListRows(courses[0].coursePrerequisites),
        },
        {
          name: courses[1].name,
          type: courses[1].type,
          description: courses[1].description,
          prerequisitesSummaryListRows: prerequisiteSummaryListRows(courses[1].coursePrerequisites),
        },
        {
          name: courses[2].name,
          type: courses[2].type,
          description: courses[2].description,
          prerequisitesSummaryListRows: prerequisiteSummaryListRows(courses[2].coursePrerequisites),
        },
      ])
    })
  })
})
