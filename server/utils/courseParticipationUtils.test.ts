import { faker } from '@faker-js/faker/locale/en_GB'
import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'

import type { RequestWithCourseParticipationDetailsBody } from './courseParticipationUtils'
import CourseParticipationUtils from './courseParticipationUtils'
import { courseParticipationFactory } from '../testutils/factories'
import type {
  CourseParticipationOutcome,
  CourseParticipationSetting,
  CourseParticipationUpdate,
} from '@accredited-programmes/api'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'
import type {
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListRowKey,
  GovukFrontendSummaryListRowValue,
} from '@govuk-frontend'

const getRowValueText = (
  rows: Array<GovukFrontendSummaryListRow>,
  keyText: GovukFrontendSummaryListRowKey['text'],
): GovukFrontendSummaryListRowValue['text'] => {
  return rows.find(row => (row.key as GovukFrontendSummaryListRowKey).text === keyText)!.value!.text!
}

describe('CourseParticipationUtils', () => {
  describe('processDetailsFormData', () => {
    let request: DeepMocked<RequestWithCourseParticipationDetailsBody>
    let expectedCourseParticipationUpdate: CourseParticipationUpdate
    const courseName = 'A course name'
    const currentYear = new Date().getFullYear()

    beforeEach(() => {
      request = createMock<RequestWithCourseParticipationDetailsBody>({})

      request.body = {
        detail: 'Some additional detail',
        outcome: {
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
        courseName,
        detail: request.body.detail,
        outcome: {
          status: request.body.outcome.status as CourseParticipationOutcome['status'],
          yearCompleted: Number(request.body.outcome.yearCompleted),
          yearStarted: undefined,
        },
        setting: {
          location: request.body.setting.communityLocation,
          type: request.body.setting.type as CourseParticipationSetting['type'],
        },
        source: request.body.source,
      }
    })

    describe('when the `request.body` is valid', () => {
      it('returns the `courseParticipationUpdate` and reports no errors', () => {
        expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })

    describe('when `request.body.detail` is an empty string when trimmed', () => {
      it('returns `courseParticipationUpdate.detail` as undefined and reports no errors', () => {
        request.body.detail = ' \n \n '
        expectedCourseParticipationUpdate.detail = undefined

        expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })

    describe('when `request.body.outcome.status` is undefined', () => {
      it('returns `courseParticipationUpdate.outcome` as undefined and reports no errors', () => {
        request.body.outcome.status = undefined
        expectedCourseParticipationUpdate.outcome = undefined

        expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })

    describe('when `request.body.outcome.status` is `complete`', () => {
      describe('and `request.body.outcome.yearCompleted` is an empty string when trimmed', () => {
        it('returns `courseParticipationUpdate.outcome.yearCompleted` as undefined and reports no errors', () => {
          request.body.outcome.yearCompleted = '  '
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearCompleted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.outcome.yearCompleted` is not a number', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearCompleted` as undefined', () => {
          request.body.outcome.yearCompleted = 'not a number'
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearCompleted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('yearCompletedError', 'Enter a year using numbers only')
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })

      describe('and `request.body.outcome.yearCompleted` is not four digits long', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearCompleted` as undefined', () => {
          request.body.outcome.yearCompleted = '202'
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearCompleted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith(
            'yearCompletedError',
            'Enter a year using 4 digits only. For example, 1994',
          )
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })

      describe('and `request.body.outcome.yearCompleted` is less than 1990', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearCompleted` as undefined', () => {
          request.body.outcome.yearCompleted = '1989'
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearCompleted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith(
            'yearCompletedError',
            `Enter a year between 1990 and ${currentYear}`,
          )
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })

      describe('and `request.body.outcome.yearCompleted` is in the future', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearCompleted` as undefined', () => {
          request.body.outcome.yearCompleted = (currentYear + 1).toString()
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearCompleted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith(
            'yearCompletedError',
            `Enter a year between 1990 and ${currentYear}`,
          )
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })
    })

    describe('when `request.body.outcome.status` is `incomplete`', () => {
      beforeEach(() => {
        request.body.outcome.status = 'incomplete'
        ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).status = request.body.outcome.status
        ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearCompleted = undefined
      })

      describe('and `request.body.outcome.yearStarted` is a valid `string` value', () => {
        it('returns `courseParticipationUpdate.outcome.yearStarted` as `number` and reports no errors', () => {
          request.body.outcome.yearStarted = '2019'
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearStarted = 2019

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.outcome.yearStarted` is an empty string when trimmed', () => {
        it('returns `courseParticipationUpdate.outcome.yearStarted` as undefined and reports no errors', () => {
          request.body.outcome.yearStarted = '  '
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearStarted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.outcome.yearStarted` is not a number', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearStarted` as undefined', () => {
          request.body.outcome.yearStarted = 'not a number'
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearStarted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('yearStartedError', 'Enter a year using numbers only')
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })

      describe('and `request.body.outcome.yearStarted` is not four digits long', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearStarted` as undefined', () => {
          request.body.outcome.yearStarted = '202'
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearStarted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith(
            'yearStartedError',
            'Enter a year using 4 digits only. For example, 1994',
          )
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })

      describe('and `request.body.outcome.yearStarted` is less than 1990', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearStarted` as undefined', () => {
          request.body.outcome.yearStarted = '1989'
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearStarted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('yearStartedError', `Enter a year between 1990 and ${currentYear}`)
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })

      describe('and `request.body.outcome.yearStarted` is in the future', () => {
        it('flashes an appropriate error message, reports an error and returns `courseParticipationUpdate.outcome.yearStarted` as undefined', () => {
          request.body.outcome.yearStarted = (currentYear + 1).toString()
          ;(expectedCourseParticipationUpdate.outcome as CourseParticipationOutcome).yearStarted = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('yearStartedError', `Enter a year between 1990 and ${currentYear}`)
          expect(request.flash).toHaveBeenCalledWith('formValues', JSON.stringify(request.body))
        })
      })
    })

    describe('when `request.body.setting.type` is undefined', () => {
      it('returns `courseParticipationUpdate.setting` as undefined and reports no errors', () => {
        request.body.setting.type = undefined
        expectedCourseParticipationUpdate.setting = undefined

        expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })

    describe('when `request.body.setting.type` is `community`', () => {
      describe('and `request.body.setting.communityLocation` is an empty string', () => {
        it('returns `courseParticipationUpdate.setting.location` as undefined and reports no errors', () => {
          request.body.setting.communityLocation = ''
          ;(expectedCourseParticipationUpdate.setting as CourseParticipationSetting).location = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })
    })

    describe('when `request.body.setting.type` is `custody`', () => {
      beforeEach(() => {
        request.body.setting.type = 'custody'
        ;(expectedCourseParticipationUpdate.setting as CourseParticipationSetting).type = request.body.setting.type
      })

      describe('and `request.body.setting.custodyLocation` is an empty string', () => {
        it('returns `courseParticipationUpdate.setting.location` as undefined and reports no errors', () => {
          request.body.setting.custodyLocation = ''
          ;(expectedCourseParticipationUpdate.setting as CourseParticipationSetting).location = undefined

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
            courseParticipationUpdate: expectedCourseParticipationUpdate,
            hasFormErrors: false,
          })
        })
      })

      describe('and `request.body.setting.custodyLocation` is not an empty string', () => {
        it('returns `courseParticipationUpdate.setting.location` as the custody location and reports no errors', () => {
          request.body.setting.custodyLocation = 'A custody location'
          ;(expectedCourseParticipationUpdate.setting as CourseParticipationSetting).location =
            request.body.setting.custodyLocation

          expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
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

        expect(CourseParticipationUtils.processDetailsFormData(request, courseName)).toEqual({
          courseParticipationUpdate: expectedCourseParticipationUpdate,
          hasFormErrors: false,
        })
      })
    })
  })

  describe('processCourseFormData', () => {
    let request: DeepMocked<Request>

    beforeEach(() => {
      request = createMock<Request>({})
    })

    describe('when the `courseName` is a non-empty string and not "Other"', () => {
      it('returns the course name and reports no errors', () => {
        const courseName = 'A known course'

        expect(CourseParticipationUtils.processCourseFormData(courseName, undefined, request)).toEqual({
          courseName,
          hasFormErrors: false,
        })
      })
    })

    describe('when the `courseName` is "Other"', () => {
      const courseName = 'Other'

      describe('and `otherCourseName` is a non-empty string when trimmed', () => {
        it('returns the other course name and reports no errors', () => {
          const otherCourseName = 'Another course'

          expect(CourseParticipationUtils.processCourseFormData(courseName, otherCourseName, request)).toEqual({
            courseName: otherCourseName,
            hasFormErrors: false,
          })
        })
      })

      describe('and `otherCourseName` is `undefined`', () => {
        it('flashes an appropriate error message and reports an error', () => {
          expect(CourseParticipationUtils.processCourseFormData(courseName, undefined, request)).toEqual({
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('otherCourseNameError', 'Enter the programme name')
        })
      })

      describe('and `otherCourseName` is an empty string when trimmed', () => {
        it('flashes an appropriate error message and reports an error', () => {
          expect(CourseParticipationUtils.processCourseFormData(courseName, '  ', request)).toEqual({
            courseName: '',
            hasFormErrors: true,
          })
          expect(request.flash).toHaveBeenCalledWith('otherCourseNameError', 'Enter the programme name')
        })
      })
    })

    describe('when the `courseName` is `undefined`', () => {
      it('flashes an appropriate error message and reports an error', () => {
        expect(CourseParticipationUtils.processCourseFormData(undefined, undefined, request)).toEqual({
          hasFormErrors: true,
        })
        expect(request.flash).toHaveBeenCalledWith('courseNameError', 'Select a programme')
      })
    })
  })

  describe('summaryListOptions', () => {
    const referralId = faker.string.uuid()
    const courseParticipationPresenter: CourseParticipationPresenter = {
      ...courseParticipationFactory.build({
        addedBy: 'ERIC_MCNALLY',
        courseName: 'A mediocre course name (aMCN)',
        createdAt: '2023-04-20T16:20:00.000Z',
        detail: 'Motivation level over 9000!',
        outcome: {
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
      addedByDisplayName: 'Eric McNally',
    }

    describe('when all fields are present on the CourseParticipation', () => {
      it('generates an object to pass into a Nunjucks macro for a GOV.UK summary list with card', () => {
        expect(CourseParticipationUtils.summaryListOptions(courseParticipationPresenter, referralId)).toEqual({
          card: {
            actions: {
              items: [
                {
                  href: `/refer/referrals/new/${referralId}/programme-history/${courseParticipationPresenter.id}/programme`,
                  text: 'Change',
                  visuallyHiddenText: 'participation',
                },
                {
                  href: `/refer/referrals/new/${referralId}/programme-history/${courseParticipationPresenter.id}/delete`,
                  text: 'Remove',
                  visuallyHiddenText: 'participation',
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
              value: { text: 'Complete, Year complete 2019' },
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
    })

    describe.each([
      [{ change: false, remove: true }, 'the change action', 'Remove'],
      [{ change: true, remove: false }, 'the remove action', 'Change'],
      [{ change: false, remove: false }, 'both actions', null],
    ])('when `withActions` is %s', (withActions, omits, actionText) => {
      it(`omits ${omits}`, () => {
        const summaryListOptions = CourseParticipationUtils.summaryListOptions(
          courseParticipationPresenter,
          referralId,
          withActions,
        )

        expect(summaryListOptions.card?.actions?.items?.length).toEqual(actionText ? 1 : 0)
        if (actionText) {
          expect(summaryListOptions.card?.actions?.items?.[0].text).toEqual(actionText)
        }
      })
    })

    describe('rows with optional values', () => {
      describe('setting', () => {
        describe('when the setting has no location', () => {
          const withoutSettingLocation: CourseParticipationPresenter = {
            ...courseParticipationPresenter,
            setting: {
              location: undefined,
              type: 'community',
            },
          }

          it("only displays the setting's type", () => {
            const { rows } = CourseParticipationUtils.summaryListOptions(withoutSettingLocation, referralId)
            expect(getRowValueText(rows, 'Setting')).toEqual('Community')
          })
        })

        describe('when there is no setting', () => {
          const withoutSetting: CourseParticipationPresenter = {
            ...courseParticipationPresenter,
            setting: undefined,
          }

          it('displays "Not known"', () => {
            const { rows } = CourseParticipationUtils.summaryListOptions(withoutSetting, referralId)
            expect(getRowValueText(rows, 'Setting')).toEqual('Not known')
          })
        })
      })

      describe('outcome', () => {
        describe('when the outcome is incomplete', () => {
          describe('and there is a yearStarted value', () => {
            const withOutcomeYearStarted: CourseParticipationPresenter = {
              ...courseParticipationPresenter,
              outcome: { status: 'incomplete', yearStarted: 2019 },
            }

            it('displays the outcome and yearStarted value', () => {
              const { rows } = CourseParticipationUtils.summaryListOptions(withOutcomeYearStarted, referralId)
              expect(getRowValueText(rows, 'Outcome')).toEqual('Incomplete, Year started 2019')
            })
          })

          describe('and there is no yearStarted value', () => {
            const withoutOutcomeYearStarted: CourseParticipationPresenter = {
              ...courseParticipationPresenter,
              outcome: { status: 'incomplete', yearStarted: undefined },
            }

            it('displays the status on its own', () => {
              const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeYearStarted, referralId)
              expect(getRowValueText(rows, 'Outcome')).toEqual('Incomplete')
            })
          })
        })

        describe('when the outcome is complete', () => {
          describe('and there is a yearCompleted value', () => {
            const withOutcomeYearCompleted: CourseParticipationPresenter = {
              ...courseParticipationPresenter,
              outcome: { status: 'complete', yearCompleted: 2019 },
            }

            it('displays the outcome and yearCompleted value', () => {
              const { rows } = CourseParticipationUtils.summaryListOptions(withOutcomeYearCompleted, referralId)
              expect(getRowValueText(rows, 'Outcome')).toEqual('Complete, Year complete 2019')
            })
          })

          describe('and there is no yearCompleted value', () => {
            const withoutOutcomeYearCompleted: CourseParticipationPresenter = {
              ...courseParticipationPresenter,
              outcome: { status: 'complete', yearCompleted: undefined },
            }

            it('displays the status on its own', () => {
              const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeYearCompleted, referralId)
              expect(getRowValueText(rows, 'Outcome')).toEqual('Complete')
            })
          })
        })

        describe('when there is no outcome', () => {
          const withoutOutcome: CourseParticipationPresenter = {
            ...courseParticipationPresenter,
            outcome: undefined,
          }

          it('displays "Not known"', () => {
            const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcome, referralId)
            expect(getRowValueText(rows, 'Outcome')).toEqual('Not known')
          })
        })
      })

      describe('additional detail', () => {
        describe('when there is no additional detail set', () => {
          const withoutOutcomeAdditionalDetail: CourseParticipationPresenter = {
            ...courseParticipationPresenter,
            detail: undefined,
          }

          it('displays "Not known"', () => {
            const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeAdditionalDetail, referralId)
            expect(getRowValueText(rows, 'Additional detail')).toEqual('Not known')
          })
        })
      })

      describe('source of information', () => {
        describe('when there is no source of information set', () => {
          const withoutSource: CourseParticipationPresenter = {
            ...courseParticipationPresenter,
            source: undefined,
          }

          it('displays "Not known"', () => {
            const { rows } = CourseParticipationUtils.summaryListOptions(withoutSource, referralId)
            expect(getRowValueText(rows, 'Source of information')).toEqual('Not known')
          })
        })
      })
    })
  })
})
