import presentCourse from './courseUtils'
import { courseAudienceFactory, courseFactory } from '../testutils/factories'

describe('courseUtils', () => {
  describe('presentCourse', () => {
    it('returns a course with UI-formatted audience and prerequisite data', () => {
      const course = courseFactory.build({
        audiences: [
          courseAudienceFactory.build({ value: 'Intimate partner violence' }),
          courseAudienceFactory.build({ value: 'General violence' }),
        ],
      })

      expect(presentCourse(course)).toEqual({
        ...course,
        audienceTags: [
          {
            text: 'Intimate partner violence',
            classes: 'govuk-tag govuk-tag--green',
          },
          {
            text: 'General violence',
            classes: 'govuk-tag govuk-tag--purple',
          },
        ],
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
