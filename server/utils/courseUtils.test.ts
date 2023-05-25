import courseWithPrerequisiteSummaryListRows from './courseUtils'
import { courseFactory } from '../testutils/factories'

describe('courseUtils', () => {
  describe('courseWithPrerequisiteSummaryListRows', () => {
    it('adds prerequisite summary list rows to a course', () => {
      const course = courseFactory.build()

      expect(courseWithPrerequisiteSummaryListRows(course)).toEqual({
        ...course,
        prerequisiteSummaryListRows: [
          {
            key: { text: course.coursePrerequisites[0].name },
            value: { text: course.coursePrerequisites[0].description },
          },
          {
            key: { text: course.coursePrerequisites[1].name },
            value: { text: course.coursePrerequisites[1].description },
          },
          {
            key: { text: course.coursePrerequisites[2].name },
            value: { text: course.coursePrerequisites[2].description },
          },
        ],
      })
    })
  })
})
