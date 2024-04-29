import CourseUtils from './courseUtils'
import { courseFactory, coursePrerequisiteFactory } from '../testutils/factories'

describe('CourseUtils', () => {
  describe('courseRadioOptions', () => {
    it('returns a formatted array of courses to use with UI radios', () => {
      const courses = courseFactory.buildList(2)
      const courseNames = courses.map(course => course.name)

      expect(CourseUtils.courseRadioOptions(courseNames)).toEqual([
        { text: courseNames[0], value: courseNames[0] },
        { text: courseNames[1], value: courseNames[1] },
      ])
    })
  })

  describe('presentCourse', () => {
    it('returns course details with UI-formatted audience and prerequisite data', () => {
      const course = courseFactory.build({
        alternateName: 'LC',
        audience: 'Intimate partner violence offence',
        audienceColour: 'green',
        coursePrerequisites: [
          coursePrerequisiteFactory.gender().build(),
          coursePrerequisiteFactory.learningNeeds().build(),
          coursePrerequisiteFactory.riskCriteria().build(),
          coursePrerequisiteFactory.setting().build(),
        ],
        name: 'Lime Course',
      })

      expect(CourseUtils.presentCourse(course)).toEqual({
        ...course,
        audienceTag: {
          attributes: { 'data-testid': 'audience-tag' },
          classes: 'govuk-tag govuk-tag--green audience-tag',
          text: 'Intimate partner violence offence',
        },
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
        const coursePresenter = CourseUtils.presentCourse(course)
        const riskCriteriaSummaryListRows = coursePresenter.prerequisiteSummaryListRows[2]

        expect(riskCriteriaSummaryListRows).toEqual({
          key: { text: 'Risk criteria' },
          value: { text: `${riskCriteriaPrerequisites[0].description}, ${riskCriteriaPrerequisites[1].description}` },
        })
      })
    })
  })
})
