import CourseParticipationUtils from './courseParticipationUtils'
import { courseParticipationFactory } from '../testutils/factories'
import type { CourseParticipationOutcome, CourseParticipationSetting } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRow, GovukFrontendSummaryListRowKey } from '@govuk-frontend'

const getRow = (
  rows: Array<GovukFrontendSummaryListRow>,
  keyText: GovukFrontendSummaryListRowKey['text'],
): GovukFrontendSummaryListRow | undefined => {
  return rows.find(row => (row.key as GovukFrontendSummaryListRowKey).text === keyText)
}

describe('CourseParticipationUtils', () => {
  describe('summaryListOptions', () => {
    const courseParticipationWithName = {
      ...courseParticipationFactory.build({
        addedBy: 'Eric McNally',
        createdAt: '2023-04-20T16:20:00.000Z',
        outcome: {
          detail: 'Motivation level over 9000!',
          status: 'complete',
          yearCompleted: 2019,
        },
        setting: {
          location: 'Greater Tharfoot',
          type: 'community',
        },
        source: 'Word of mouth',
      }),
      name: 'A mediocre course name (aMCN)',
    }

    it('generates an object to pass into a GOV.UK summary list Nunjucks macro', () => {
      expect(CourseParticipationUtils.summaryListOptions(courseParticipationWithName)).toEqual({
        card: {
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

    fdescribe('when fields are undefined', () => {
      it.each([
        ['setting', undefined, 'Setting'],
        ['outcome', undefined, 'Outcome'],
        ['outcome', { detail: undefined }, 'Additional detail'],
        ['source', undefined, 'Source of information'],
      ])(
        'when %s is %s, there is no %s row',
        (field: string, value, keyText: GovukFrontendSummaryListRowKey['text']) => {
          const withoutField = { ...courseParticipationWithName, [field]: value }

          const { rows } = CourseParticipationUtils.summaryListOptions(withoutField)
          const fieldRow = getRow(rows, keyText)

          expect(fieldRow).toBeUndefined()
        },
      )

      it('when setting location is undefined, only the type is shown in the Setting row', () => {
        const withoutSettingLocation = {
          ...courseParticipationWithName,
          setting: { location: undefined, type: 'community' as CourseParticipationSetting['type'] },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutSettingLocation)
        const settingRow = getRow(rows, 'Setting')

        expect(settingRow).toEqual({ key: { text: 'Setting' }, value: { text: 'Community' } })
      })

      it('when outcome status is undefined, there is no Outcome row', () => {
        const withoutOutcomeStatus = { ...courseParticipationWithName, outcome: { status: undefined } }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeStatus)
        const outcomeRow = getRow(rows, 'Outcome')

        expect(outcomeRow).toBeUndefined()
      })

      it('when yearStarted is undefined on an incomplete outcome, only the status is shown in the Outcome row', () => {
        const withoutOutcomeYearStarted = {
          ...courseParticipationWithName,
          outcome: { status: 'incomplete' as CourseParticipationOutcome['status'], yearStarted: undefined },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeYearStarted)
        const outcomeRow = getRow(rows, 'Outcome')

        expect(outcomeRow).toEqual({ key: { text: 'Outcome' }, value: { text: 'Incomplete' } })
      })

      it('when yearCompleted is undefined on a complete outcome, only the status is shown in the Outcome row', () => {
        const withoutOutcomeYearCompleted = {
          ...courseParticipationWithName,
          outcome: { status: 'complete' as CourseParticipationOutcome['status'], yearCompleted: undefined },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeYearCompleted)
        const outcomeRow = getRow(rows, 'Outcome')

        expect(outcomeRow).toEqual({ key: { text: 'Outcome' }, value: { text: 'Complete' } })
      })
    })
  })
})
