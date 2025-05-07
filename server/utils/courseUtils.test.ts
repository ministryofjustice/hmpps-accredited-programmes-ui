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

  describe('formatIntensityValue', () => {
    it.each([
      ['HIGH', 'High intensity'],
      ['HIGH_MODERATE', 'High or moderate intensity'],
      ['MODERATE', 'Moderate intensity'],
      ['UNKNOWN', 'Unknown'],
      [undefined, 'Unknown'],
    ])('returns the correct intensity text for %s', (intensity, expectedText) => {
      expect(CourseUtils.formatIntensityValue(intensity)).toBe(expectedText)
    })
  })

  describe('isBuildingChoices', () => {
    it('should ignore case', () => {
      expect(CourseUtils.isBuildingChoices('BUILDING CHOICES: moderate intensity')).toBe(true)
      expect(CourseUtils.isBuildingChoices('buIlDiNg ChOiCeS: high intensity')).toBe(true)
    })

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

  describe('isHsp', () => {
    it('should ignore case', () => {
      expect(CourseUtils.isHsp('Healthy Sex Programme')).toBe(true)
      expect(CourseUtils.isHsp('HEALTHY SEX PROGRAMME')).toBe(true)
    })

    it('should return false when the course displayName does not equal "healthy sex programme"', () => {
      expect(CourseUtils.isHsp('Lime Course')).toBe(false)
    })

    it('should return false when the course displayName is undefined', () => {
      expect(CourseUtils.isHsp()).toBe(false)
    })
  })

  describe('noOfferingsMessage', () => {
    it('returns a message for when a course has no offerings', () => {
      expect(CourseUtils.noOfferingsMessage('Test Course')).toBe(
        'To find out where Test Course runs and for more information, speak to your Offender Management Unit (custody) or regional probation team (community).',
      )
    })

    describe('when the course name is "Healthy Identity Intervention"', () => {
      it('returns a message to say the user should contact the regional psychology counter-terrorism lead or regional psychology team', () => {
        expect(CourseUtils.noOfferingsMessage('Healthy Identity Intervention')).toBe(
          'To find out where Healthy Identity Intervention runs and for more information, contact the regional psychology counter-terrorism lead or regional psychology team.',
        )
      })
    })

    describe('when the course name is "Healthy Sex Programme"', () => {
      it('returns a message with the contact details for the national psychology team', () => {
        expect(CourseUtils.noOfferingsMessage('Healthy Sex Programme')).toBe(
          'To find out where Healthy Sex Programme runs and for more information, email the national psychology team: <a href="mailto:NationalHSP@justice.gov.uk">NationalHSP@justice.gov.uk</a>',
        )
      })
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

  describe('audience and hasLdc encoding/decoding', () => {
    describe('encodeAudienceAndHasLdc', () => {
      it('should give just the audience name when does not have LDC', () => {
        expect(CourseUtils.encodeAudienceAndHasLdc('General violence', 'false')).toBe('General violence::hasLdc=false')
      })

      it('should append hasLdc when it does have LDC', () => {
        expect(CourseUtils.encodeAudienceAndHasLdc('General violence', 'true')).toBe('General violence::hasLdc=true')
      })
    })

    describe('decodeAudienceAndHasLdc', () => {
      it('should identify when an audience name does not have LDC', () => {
        // When
        const { audienceName, hasLdcString } = CourseUtils.decodeAudienceAndHasLdc('General violence::hasLdc=false')

        // Then
        expect(audienceName).toBe('General violence')
        expect(hasLdcString).toBe('false')
      })

      it('should identify when an audience does have LDC', () => {
        // When
        const { audienceName, hasLdcString } = CourseUtils.decodeAudienceAndHasLdc('General violence::hasLdc=true')

        // Then
        expect(audienceName).toBe('General violence')
        expect(hasLdcString).toBe('true')
      })
    })
  })
})
