import CourseUtils from './courseUtils'
import { audienceFactory, courseFactory, coursePrerequisiteFactory } from '../testutils/factories'

describe('CourseUtils', () => {
  describe('audienceSelectItems', () => {
    it('returns a formatted array of audiences to use with UI selects', () => {
      const audiences = audienceFactory.buildList(2)

      expect(CourseUtils.audienceSelectItems(audiences)).toEqual([
        { text: audiences[0].name, value: audiences[0].id },
        { text: audiences[1].name, value: audiences[1].id },
      ])
    })
  })

  describe('buildingChoicesAnswersSummaryListRows', () => {
    it('returns a formatted array of building choices form data to use with UI summary lists', () => {
      const formData = {
        isConvictedOfSexualOffence: 'false',
        isInAWomensPrison: 'false',
      }

      expect(CourseUtils.buildingChoicesAnswersSummaryListRows(formData)).toEqual([
        {
          key: { classes: 'govuk-!-width-one-third', text: 'Convicted of a sexual offence' },
          value: { text: 'No' },
        },
        {
          key: { classes: 'govuk-!-width-one-third', text: 'In a women’s prison' },
          value: { text: 'No' },
        },
      ])
    })

    describe('when the form data is true', () => {
      it('returns "Yes" as the value', () => {
        const formData = {
          isConvictedOfSexualOffence: 'true',
          isInAWomensPrison: 'true',
        }

        expect(CourseUtils.buildingChoicesAnswersSummaryListRows(formData)).toEqual([
          {
            key: { classes: 'govuk-!-width-one-third', text: 'Convicted of a sexual offence' },
            value: { text: 'Yes' },
          },
          {
            key: { classes: 'govuk-!-width-one-third', text: 'In a women’s prison' },
            value: { text: 'Yes' },
          },
        ])
      })
    })
  })

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

  describe('isBuildingChoices', () => {
    it('returns true when the course displayName starts with "Building Choices:"', () => {
      expect(CourseUtils.isBuildingChoices('Building Choices: moderate intensity')).toBe(true)
    })

    it('returns false when the course displayName does not start with "Building Choices:"', () => {
      expect(CourseUtils.isBuildingChoices('Lime Course')).toBe(false)
    })

    it('returns false when the course displayName is undefined', () => {
      expect(CourseUtils.isBuildingChoices()).toBe(false)
    })
  })

  describe('presentCourse', () => {
    it('returns course details with UI-formatted audience and prerequisite data', () => {
      const coursePrerequisites = [
        coursePrerequisiteFactory.gender().build(),
        coursePrerequisiteFactory.learningNeeds().build(),
        coursePrerequisiteFactory.riskCriteria().build(),
        coursePrerequisiteFactory.setting().build(),
        coursePrerequisiteFactory.suitableForPeopleWithLDCs().build(),
        coursePrerequisiteFactory.equivalentNonLDCProgramme().build(),
        coursePrerequisiteFactory.equivalentLDCProgramme().build(),
        coursePrerequisiteFactory.timeToComplete().build(),
        coursePrerequisiteFactory.needsCriteria().build(),
        coursePrerequisiteFactory.riskCritieriaPost().build(),
        coursePrerequisiteFactory.riskCritieriaPre().build(),
      ]
      const course = courseFactory.build({
        alternateName: 'LC',
        audience: 'Intimate partner violence offence',
        audienceColour: 'green',
        coursePrerequisites,
        id: 'lime-course-1',
        name: 'Lime Course',
      })

      expect(CourseUtils.presentCourse(course)).toEqual({
        ...course,
        audienceTag: {
          attributes: { 'data-testid': 'audience-tag' },
          classes: 'govuk-tag govuk-tag--green audience-tag',
          text: 'Intimate partner violence offence',
        },
        href: '/find/programmes/lime-course-1',
        prerequisiteSummaryListRows: [
          {
            key: { text: 'Setting' },
            value: { html: coursePrerequisites[3].description },
          },
          {
            key: { text: 'Gender' },
            value: { html: coursePrerequisites[0].description },
          },
          {
            key: { text: 'Risk criteria' },
            value: {
              html: `${coursePrerequisites[10].description}<br><br>${coursePrerequisites[2].description}<br><br>${coursePrerequisites[9].description}`,
            },
          },
          {
            key: { text: 'Needs criteria' },
            value: { html: coursePrerequisites[8].description },
          },
          {
            key: { text: 'Learning needs' },
            value: { html: coursePrerequisites[1].description },
          },
          {
            key: { text: 'Suitable for people with learning disabilities or challenges (LDC)?' },
            value: { html: coursePrerequisites[4].description },
          },
          {
            key: { text: 'Equivalent non-LDC programme' },
            value: { html: coursePrerequisites[5].description },
          },
          {
            key: { text: 'Equivalent LDC programme' },
            value: { html: coursePrerequisites[6].description },
          },
          {
            key: { text: 'Time to complete' },
            value: { html: coursePrerequisites[7].description },
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
          value: { html: `${riskCriteriaPrerequisites[0].description}<br>${riskCriteriaPrerequisites[1].description}` },
        })
      })
    })

    describe('when a course displayName starts with "Building Choices:"', () => {
      it('sets the href to the building choices form', () => {
        const course = courseFactory.build({ displayName: 'Building Choices: moderate intensity' })
        const coursePresenter = CourseUtils.presentCourse(course)

        expect(coursePresenter.href).toBe(`/find/building-choices/${course.id}`)
      })
    })
  })
})
