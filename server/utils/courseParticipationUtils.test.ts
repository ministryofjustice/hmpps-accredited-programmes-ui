import { faker } from '@faker-js/faker/locale/en_GB'
import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'

import CourseParticipationUtils, { type RequestWithDetailsBody } from './courseParticipationUtils'
import { courseParticipationFactory } from '../testutils/factories'
import type {
  CourseParticipationOutcome,
  CourseParticipationSetting,
  CourseParticipationUpdate,
} from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRow, GovukFrontendSummaryListRowKey } from '@govuk-frontend'

const getRow = (
  rows: Array<GovukFrontendSummaryListRow>,
  keyText: GovukFrontendSummaryListRowKey['text'],
): GovukFrontendSummaryListRow | undefined => {
  return rows.find(row => (row.key as GovukFrontendSummaryListRowKey).text === keyText)
}

describe('CourseParticipationUtils', () => {
  describe('processDetailsFormData', () => {
    let request: DeepMocked<RequestWithDetailsBody>
    let expectedCourseParticipationUpdate: CourseParticipationUpdate

    beforeEach(() => {
      request = createMock<RequestWithDetailsBody>({})

      request.body = {
        outcome: {
          detail: 'Some additional detail',
          status: 'complete',
          yearCompleted: '2019',
          yearStarted: '',
        },
        setting: {
          communityLocation: 'Somewhere',
          custodyLocation: '',
          type: 'community',
        },
        source: 'The source',
      }

      expectedCourseParticipationUpdate = {
        outcome: {
          detail: request.body.outcome.detail,
          status: request.body.outcome.status,
          yearCompleted: Number(request.body.outcome.yearCompleted),
          yearStarted: undefined,
        },
        setting: {
          location: request.body.setting.communityLocation,
          type: request.body.setting.type,
        },
        source: request.body.source,
      }
    })

    describe('when the `request.body` is valid', () => {
      it('returns the `courseParticipationUpdate` and reports no errors', () => {
        expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })

    describe('when `request.body.outcome.detail` is an empty string when trimmed', () => {
      it('returns `courseParticipationUpdate.outcome.detail` as undefined and reports no errors', () => {
        request.body.outcome.detail = ' \n \n '
        expectedCourseParticipationUpdate.outcome.detail = undefined

        expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })

    describe('when `request.body.outcome.status` is `complete`', () => {
      describe('and `request.body.outcome.yearCompleted` is an empty string', () => {
        it('returns `courseParticipationUpdate.outcome.yearCompleted` as undefined and reports no errors', () => {
          request.body.outcome.yearCompleted = ''
          expectedCourseParticipationUpdate.outcome.yearCompleted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.outcome.yearCompleted` is not a number', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearCompleted` as undefined', () => {
          request.body.outcome.yearCompleted = 'not a number'
          expectedCourseParticipationUpdate.outcome.yearCompleted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('yearCompletedError', 'Enter a year using numbers only')
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })
    })

    describe('when `request.body.outcome.status` is `incomplete`', () => {
      beforeEach(() => {
        request.body.outcome.status = 'incomplete'
        expectedCourseParticipationUpdate.outcome.status = request.body.outcome.status
        expectedCourseParticipationUpdate.outcome.yearCompleted = undefined
      })

      describe('and `request.body.outcome.yearCompleted` is a valid `string` value', () => {
        it('returns `courseParticipationUpdate.outcome.yearStarted` as `number` and reports no errors', () => {
          request.body.outcome.yearStarted = '2019'
          expectedCourseParticipationUpdate.outcome.yearStarted = 2019

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.outcome.yearStarted` is an empty string', () => {
        it('returns `courseParticipationUpdate.outcome.yearStarted` as undefined and reports no errors', () => {
          request.body.outcome.yearStarted = ''
          expectedCourseParticipationUpdate.outcome.yearStarted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.outcome.yearStarted` is not a number', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearStarted` as undefined', () => {
          request.body.outcome.yearStarted = 'not a number'
          expectedCourseParticipationUpdate.outcome.yearStarted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('yearStartedError', 'Enter a year using numbers only')
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })
    })

    describe('when `request.body.setting.type` is `community`', () => {
      describe('and `request.body.setting.communityLocation` is an empty string', () => {
        it('returns `courseParticipationUpdate.setting.location` as undefined and reports no errors', () => {
          request.body.setting.communityLocation = ''
          expectedCourseParticipationUpdate.setting.location = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })
    })

    describe('when `request.body.setting.type` is `custody`', () => {
      beforeEach(() => {
        request.body.setting.type = 'custody'
        expectedCourseParticipationUpdate.setting.type = request.body.setting.type
      })

      describe('and `request.body.setting.custodyLocation` is an empty string', () => {
        it('returns `courseParticipationUpdate.setting.location` as undefined and reports no errors', () => {
          request.body.setting.custodyLocation = ''
          expectedCourseParticipationUpdate.setting.location = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.setting.custodyLocation` is not an empty string', () => {
        it('returns `courseParticipationUpdate.setting.location` as the custody location and reports no errors', () => {
          request.body.setting.custodyLocation = 'A custody location'
          expectedCourseParticipationUpdate.setting.location = request.body.setting.custodyLocation

          expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })
    })

    describe('when `request.body.source` is an empty string when trimmed', () => {
      it('returns `courseParticipationUpdate.source` as undefined and reports no errors', () => {
        request.body.source = ' \n \n '
        expectedCourseParticipationUpdate.source = undefined

        expect(CourseParticipationUtils.processDetailsFormData(request)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })
  })

  describe('processedCourseFormData', () => {
    let request: DeepMocked<Request>

    beforeEach(() => {
      request = createMock<Request>({})
    })

    describe('when the `courseId` is a non-empty string', () => {
      it('returns the course ID and reports no errors', () => {
        const validId = 'AN-ID'

        expect(CourseParticipationUtils.processedCourseFormData(validId, undefined, request)).toEqual({
          courseId: validId,
          hasFormErrors: false,
        })
      })
    })

    describe("when the `courseId` is `'other'`", () => {
      const otherId = 'other'

      describe('and `otherCourseName` is a non-empty string when trimmed', () => {
        it('returns the other course name and reports no errors', () => {
          const otherCourseName = 'Another course'

          expect(CourseParticipationUtils.processedCourseFormData(otherId, otherCourseName, request)).toEqual({
            hasFormErrors: false,
            otherCourseName,
          })
        })
      })

      describe('and `otherCourseName` is `undefined`', () => {
        it('flashes an appropriate error message and reports an error', () => {
          expect(CourseParticipationUtils.processedCourseFormData(otherId, undefined, request)).toEqual({
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('otherCourseNameError', 'Enter the programme name')
        })
      })

      describe('and `otherCourseName` is an empty string when trimmed', () => {
        it('flashes an appropriate error message and reports an error', () => {
          expect(CourseParticipationUtils.processedCourseFormData(otherId, '  ', request)).toEqual({
            hasFormErrors: true,
            otherCourseName: '',
          })
          expect(request.flash).toHaveBeenCalledWith('otherCourseNameError', 'Enter the programme name')
        })
      })
    })

    describe('when the `courseId` is `undefined`', () => {
      it('flashes an appropriate error message and reports an error', () => {
        expect(CourseParticipationUtils.processedCourseFormData(undefined, undefined, request)).toEqual({
          hasFormErrors: true,
        })
        expect(request.flash).toHaveBeenCalledWith('courseIdError', 'Select a programme')
      })
    })
  })

  describe('summaryListOptions', () => {
    const referralId = faker.string.uuid()
    const courseParticipationWithName = {
      ...courseParticipationFactory.build({
        addedBy: 'Eric McNally',
        createdAt: '2023-04-20T16:20:00.000Z',
        outcome: {
          detail: 'Motivation level over 9000!',
          status: 'complete',
          yearCompleted: 2019,
          yearStarted: undefined,
        },
        setting: {
          location: 'Greater Tharfoot',
          type: 'community',
        },
        source: 'Word of mouth',
      }),
      name: 'A mediocre course name (aMCN)',
    }

    it('generates an object to pass into a Nunjucks macro for a GOV.UK summary list with card', () => {
      expect(CourseParticipationUtils.summaryListOptions(courseParticipationWithName, referralId)).toEqual({
        card: {
          actions: {
            items: [
              {
                href: `/referrals/${referralId}/programme-history/${courseParticipationWithName.id}/programme`,
                text: 'Change',
                visuallyHiddenText: `participation for ${courseParticipationWithName.name}`,
              },
              {
                href: `/referrals/${referralId}/programme-history/${courseParticipationWithName.id}/delete`,
                text: 'Remove',
                visuallyHiddenText: `participation for ${courseParticipationWithName.name}`,
              },
            ],
          },
          title: {
            text: 'A mediocre course name (aMCN)',
          },
        },
        rows: [
          {
            key: { text: 'Programme name' },
            value: { text: 'A mediocre course name (aMCN)' },
          },
          {
            key: { text: 'Setting' },
            value: { text: 'Community, Greater Tharfoot' },
          },
          {
            key: { text: 'Outcome' },
            value: { text: 'Complete - completed in 2019' },
          },
          {
            key: { text: 'Additional detail' },
            value: { text: 'Motivation level over 9000!' },
          },
          {
            key: { text: 'Source of information' },
            value: { text: 'Word of mouth' },
          },
          {
            key: { text: 'Added by' },
            value: { text: 'Eric McNally, 20 April 2023' },
          },
        ],
      })
    })

    describe('when `withActions` is `false`', () => {
      it('omits the actions', () => {
        const summaryListOptions = CourseParticipationUtils.summaryListOptions(
          courseParticipationWithName,
          referralId,
          false,
        )
        expect(summaryListOptions.card?.actions).toBeUndefined()
      })
    })

    describe('when rows are missing required data', () => {
      it.each([
        ['Setting', 'setting', undefined],
        ['Outcome', 'outcome', undefined],
        ['Outcome', 'outcome', { status: undefined }],
        ['Additional detail', 'outcome', { detail: undefined }],
        ['Source of information', 'source', undefined],
      ])('omits the %s row when %s is %s', (keyText: GovukFrontendSummaryListRowKey['text'], field: string, value) => {
        const withoutField = { ...courseParticipationWithName, [field]: value }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutField, referralId)
        const fieldRow = getRow(rows, keyText)

        expect(fieldRow).toBeUndefined()
      })

      it('only shows the location in the Setting row when setting location is undefined', () => {
        const withoutSettingType = {
          ...courseParticipationWithName,
          setting: { location: 'Stockport', type: undefined },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutSettingType, referralId)
        const settingRow = getRow(rows, 'Setting')

        expect(settingRow).toEqual({ key: { text: 'Setting' }, value: { text: 'Stockport' } })
      })

      it('only shows the type in the Setting row when setting location is undefined', () => {
        const withoutSettingLocation = {
          ...courseParticipationWithName,
          setting: { location: undefined, type: 'community' as CourseParticipationSetting['type'] },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutSettingLocation, referralId)
        const settingRow = getRow(rows, 'Setting')

        expect(settingRow).toEqual({ key: { text: 'Setting' }, value: { text: 'Community' } })
      })

      it('only shows the status in the Outcome row when yearStarted is undefined on an incomplete outcome', () => {
        const withoutOutcomeYearStarted = {
          ...courseParticipationWithName,
          outcome: { status: 'incomplete' as CourseParticipationOutcome['status'], yearStarted: undefined },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeYearStarted, referralId)
        const outcomeRow = getRow(rows, 'Outcome')

        expect(outcomeRow).toEqual({ key: { text: 'Outcome' }, value: { text: 'Incomplete' } })
      })

      it('only shows the status in the Outcome row when yearCompleted is undefined on a complete outcome', () => {
        const withoutOutcomeYearCompleted = {
          ...courseParticipationWithName,
          outcome: { status: 'complete' as CourseParticipationOutcome['status'], yearCompleted: undefined },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeYearCompleted, referralId)
        const outcomeRow = getRow(rows, 'Outcome')

        expect(outcomeRow).toEqual({ key: { text: 'Outcome' }, value: { text: 'Complete' } })
      })
    })
  })
})
