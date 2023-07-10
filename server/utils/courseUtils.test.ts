import presentCourse from './courseUtils'
import { courseAudienceFactory, courseFactory, coursePrerequisiteFactory } from '../testutils/factories'

describe('courseUtils', () => {
  describe('presentCourse', () => {
    it('returns course details with UI-formatted audience and prerequisite data', () => {
      const course = courseFactory.build({
        name: 'Lime Course',
        alternateName: 'LC',
        audiences: [
          courseAudienceFactory.build({ value: 'Intimate partner violence offence' }),
          courseAudienceFactory.build({ value: 'General violence offence' }),
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
        nameAndAlternateName: 'Lime Course (LC)',
        audienceTags: [
          {
            text: 'Intimate partner violence offence',
            classes: 'govuk-tag govuk-tag--green',
          },
          {
            text: 'General violence offence',
            classes: 'govuk-tag govuk-tag--yellow',
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

    describe('when a course has multiple prerequisites with the same name', () => {
      it('combines the descriptions of the matching prerequisites', () => {
        const riskCriteriaPrerequisites = coursePrerequisiteFactory.riskCriteria().buildList(2)
        const course = courseFactory.build({ coursePrerequisites: riskCriteriaPrerequisites })
        const coursePresenter = presentCourse(course)
        const riskCriteriaSummaryListRows = coursePresenter.prerequisiteSummaryListRows[2]

        expect(riskCriteriaSummaryListRows).toEqual({
          key: { text: 'Risk criteria' },
          value: { text: `${riskCriteriaPrerequisites[0].description}, ${riskCriteriaPrerequisites[1].description}` },
        })
      })
    })

    describe('when a course has no `alternateName`', () => {
      it('just uses the `name` as the `nameAndAlternateName`', () => {
        const course = courseFactory.build({ alternateName: null })

        expect(presentCourse(course).nameAndAlternateName).toEqual(course.name)
      })
    })
  })
})
