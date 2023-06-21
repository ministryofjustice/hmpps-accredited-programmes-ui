import presentCourse from './courseUtils'
import { courseAudienceFactory, courseFactory, coursePrerequisiteFactory } from '../testutils/factories'

describe('courseUtils', () => {
  describe('presentCourse', () => {
    it('returns a course with UI-formatted audience and prerequisite data', () => {
      const course = courseFactory.build({
        audiences: [
          courseAudienceFactory.build({ value: 'Intimate partner violence' }),
          courseAudienceFactory.build({ value: 'General violence' }),
        ],
        coursePrerequisites: [
          coursePrerequisiteFactory.gender().build(),
          coursePrerequisiteFactory.learningNeeds().build(),
          coursePrerequisiteFactory.riskCriteria().build(),
          coursePrerequisiteFactory.setting().build(),
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
            key: { text: 'Setting' },
            value: { text: course.coursePrerequisites[3].description },
          },
          {
            key: { text: 'Gender' },
            value: { text: course.coursePrerequisites[0].description },
          },
          {
            key: { text: 'Risk criteria' },
            value: { text: course.coursePrerequisites[2].description },
          },
          {
            key: { text: 'Learning needs' },
            value: { text: course.coursePrerequisites[1].description },
          },
        ],
      })
    })
  })
})
