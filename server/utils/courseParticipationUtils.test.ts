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

    it('generates an object to pass into a Nunjucks macro for a GOV.UK summary list with card', () => {
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

    describe('when rows are missing required data', () => {
      it.each([
        ['Setting', 'setting', undefined],
        ['Outcome', 'outcome', undefined],
        ['Outcome', 'outcome', { status: undefined }],
        ['Additional detail', 'outcome', { detail: undefined }],
        ['Source of information', 'source', undefined],
      ])('omits the %s row when %s is %s', (keyText: GovukFrontendSummaryListRowKey['text'], field: string, value) => {
        const withoutField = { ...courseParticipationWithName, [field]: value }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutField)
        const fieldRow = getRow(rows, keyText)

        expect(fieldRow).toBeUndefined()
      })

      it('only shows the type in the Setting row when setting location is undefined', () => {
        const withoutSettingLocation = {
          ...courseParticipationWithName,
          setting: { location: undefined, type: 'community' as CourseParticipationSetting['type'] },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutSettingLocation)
        const settingRow = getRow(rows, 'Setting')

        expect(settingRow).toEqual({ key: { text: 'Setting' }, value: { text: 'Community' } })
      })

      it('only shows the status in the Outcome row when yearStarted is undefined on an incomplete outcome', () => {
        const withoutOutcomeYearStarted = {
          ...courseParticipationWithName,
          outcome: { status: 'incomplete' as CourseParticipationOutcome['status'], yearStarted: undefined },
        }

        const { rows } = CourseParticipationUtils.summaryListOptions(withoutOutcomeYearStarted)
        const outcomeRow = getRow(rows, 'Outcome')

        expect(outcomeRow).toEqual({ key: { text: 'Outcome' }, value: { text: 'Incomplete' } })
      })

      it('only shows the status in the Outcome row when yearCompleted is undefined on a complete outcome', () => {
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
