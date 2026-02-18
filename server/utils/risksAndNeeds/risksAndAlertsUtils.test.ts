import RisksAndAlertsUtils from './risksAndAlertsUtils'
import type { RisksAndAlerts } from '@accredited-programmes/models'

describe('RisksAndAlertsUtils', () => {
  describe('alertsGroupTables', () => {
    it('formats alerts data in the appropriate format for passing to an alerts group table Nunjucks macro', () => {
      const alerts = [
        { alertType: 'Alert type 1', dateCreated: '2021-01-01', description: 'Description 1' },
        { alertType: 'Alert type 2', dateCreated: '2021-01-02', description: 'Description 2' },
        { alertType: 'Alert type 1', dateCreated: '2021-01-03', description: 'Description 3' },
      ]

      expect(RisksAndAlertsUtils.alertsGroupTables(alerts)).toEqual([
        {
          attributes: { 'data-testid': 'alerts-group-table-1' },
          caption: 'Alert type 1',
          captionClasses: 'govuk-table__caption--s',
          classes: 'alerts-group-table',
          head: [{ classes: 'govuk-!-width-one-half', text: 'Details' }, { text: 'Start date' }],
          rows: [
            [{ text: 'Description 1' }, { text: '1 January 2021' }],
            [{ text: 'Description 3' }, { text: '3 January 2021' }],
          ],
        },
        {
          attributes: { 'data-testid': 'alerts-group-table-2' },
          caption: 'Alert type 2',
          captionClasses: 'govuk-table__caption--s',
          classes: 'alerts-group-table',
          head: [{ classes: 'govuk-!-width-one-half', text: 'Details' }, { text: 'Start date' }],
          rows: [[{ text: 'Description 2' }, { text: '2 January 2021' }]],
        },
      ])
    })

    describe('when alerts are missing', () => {
      it('returns an empty array', () => {
        expect(RisksAndAlertsUtils.alertsGroupTables(undefined)).toEqual([])
      })
    })
  })

  describe('allReoffendingPredictor', () => {
    it('formats OGRS4 all reoffending data in the appropriate format for passing to the view', () => {
      const risksAndAlerts: RisksAndAlerts = {
        lastUpdated: '2023-12-18',
        ogrs4Risks: {
          allReoffendingBand: 'Medium',
          allReoffendingScore: 45.5,
          allReoffendingScoreType: 'Dynamic',
        },
      }

      expect(RisksAndAlertsUtils.allReoffendingPredictor(risksAndAlerts)).toEqual({
        bandPercentages: ['0%', '49%', '74%', '90%', '100%'],
        lastUpdated: '2023-12-18',
        level: 'MEDIUM',
        score: 45.5,
        staticOrDynamic: 'DYNAMIC',
        type: 'All reoffending predictor',
      })
    })

    describe('when the allReoffendingBand is missing', () => {
      it('uses "UNKNOWN" for the level', () => {
        const risksAndAlerts: RisksAndAlerts = {
          lastUpdated: '2023-12-18',
          ogrs4Risks: {
            allReoffendingScore: 45.5,
            allReoffendingScoreType: 'Dynamic',
          },
        }

        expect(RisksAndAlertsUtils.allReoffendingPredictor(risksAndAlerts)).toEqual(
          expect.objectContaining({
            level: 'UNKNOWN',
          }),
        )
      })
    })

    describe('when ogrs4Risks is missing', () => {
      it('handles undefined values gracefully', () => {
        const risksAndAlerts: RisksAndAlerts = {
          lastUpdated: '2023-12-18',
        }

        expect(RisksAndAlertsUtils.allReoffendingPredictor(risksAndAlerts)).toEqual({
          bandPercentages: ['0%', '49%', '74%', '90%', '100%'],
          lastUpdated: '2023-12-18',
          level: 'UNKNOWN',
          score: undefined,
          staticOrDynamic: undefined,
          type: 'All reoffending predictor',
        })
      })
    })
  })

  describe('levelOrUnknown', () => {
    describe('when provided a level', () => {
      it('returns the level unmodified', () => {
        expect(RisksAndAlertsUtils.levelOrUnknown('HIGH')).toEqual('HIGH')
      })
    })

    describe('when provided `undefined`', () => {
      it('returns "UNKNOWN"', () => {
        expect(RisksAndAlertsUtils.levelOrUnknown(undefined)).toEqual('UNKNOWN')
      })
    })

    describe('when provided `null`', () => {
      it('returns "UNKNOWN"', () => {
        expect(RisksAndAlertsUtils.levelOrUnknown(null)).toEqual('UNKNOWN')
      })
    })
  })

  describe('levelOrUnknownStr', () => {
    describe('when provided a level string', () => {
      it('returns the level in uppercase', () => {
        expect(RisksAndAlertsUtils.levelOrUnknownStr('high')).toEqual('HIGH')
      })
    })

    describe('when provided a level string with spaces', () => {
      it('returns the level in uppercase with spaces replaced by underscores', () => {
        expect(RisksAndAlertsUtils.levelOrUnknownStr('Very high')).toEqual('VERY_HIGH')
      })
    })

    describe('when provided `undefined`', () => {
      it('returns "UNKNOWN"', () => {
        expect(RisksAndAlertsUtils.levelOrUnknownStr(undefined)).toEqual('UNKNOWN')
      })
    })

    describe('when provided `null`', () => {
      it('returns "UNKNOWN"', () => {
        expect(RisksAndAlertsUtils.levelOrUnknownStr(null)).toEqual('UNKNOWN')
      })
    })

    describe('when provided an empty string', () => {
      it('returns "UNKNOWN"', () => {
        expect(RisksAndAlertsUtils.levelOrUnknownStr('')).toEqual('UNKNOWN')
      })
    })
  })

  describe('levelText', () => {
    describe('when provided a level without underscores', () => {
      it('returns the level unmodified', () => {
        expect(RisksAndAlertsUtils.levelText('HIGH')).toEqual('HIGH')
      })
    })

    describe('when provided a level with underscores', () => {
      it('returns the level with spaces replacing underscores', () => {
        expect(RisksAndAlertsUtils.levelText('VERY_HIGH')).toEqual('VERY HIGH')
      })
    })

    describe('when proper case is requested', () => {
      it('returns the level in proper case', () => {
        expect(RisksAndAlertsUtils.levelText('VERY_HIGH', 'proper')).toEqual('Very high')
      })
    })
  })

  describe('ospBox', () => {
    it('formats OSP data in the appropriate format for passing to an OSP box Nunjucks macro', () => {
      expect(RisksAndAlertsUtils.ospBox('OSP/C', 'VERY_HIGH')).toEqual({
        dataTestId: 'osp-c-box',
        levelClass: 'osp-box--very-high',
        levelText: 'VERY HIGH',
        type: 'OSP/C',
      })
    })

    describe('when the level is missing', () => {
      it('uses "unknown" for the level', () => {
        expect(RisksAndAlertsUtils.ospBox('OSP/C', undefined)).toEqual(
          expect.objectContaining({
            levelClass: 'osp-box--unknown',
            levelText: 'UNKNOWN',
          }),
        )
      })
    })
  })

  describe('riskBox', () => {
    it('formats risk data in the appropriate format for passing to an risk box Nunjucks macro', () => {
      expect(RisksAndAlertsUtils.riskBox('RSR', 'MEDIUM')).toEqual({
        category: 'RSR',
        dataTestId: 'rsr-risk-box',
        levelClass: 'risk-box--medium',
        levelText: 'MEDIUM',
      })
    })

    describe('when the level is missing', () => {
      it('uses "unknown" for the level', () => {
        expect(RisksAndAlertsUtils.riskBox('RSR', undefined)).toEqual(
          expect.objectContaining({
            levelClass: 'risk-box--unknown',
            levelText: 'UNKNOWN',
          }),
        )
      })
    })

    describe('when a figure is provided', () => {
      it('includes the figure', () => {
        expect(RisksAndAlertsUtils.riskBox('RSR', 'MEDIUM', '3.25')).toEqual(
          expect.objectContaining({ figure: '3.25' }),
        )
      })
    })

    describe('when a data test ID prefix is provided', () => {
      it('interpolates the provided prefix', () => {
        expect(RisksAndAlertsUtils.riskBox('RSR', 'MEDIUM', undefined, 'something-very-special')).toEqual(
          expect.objectContaining({ dataTestId: 'something-very-special-risk-box' }),
        )
      })
    })
  })

  describe('roshTable', () => {
    const risksAndAlerts: RisksAndAlerts = {
      riskChildrenCommunity: 'LOW',
      riskChildrenCustody: 'LOW',
      riskKnownAdultCommunity: 'MEDIUM',
      riskKnownAdultCustody: 'HIGH',
      riskPrisonersCustody: 'LOW',
      riskPublicCommunity: 'LOW',
      riskPublicCustody: 'LOW',
      riskStaffCommunity: 'LOW',
      riskStaffCustody: 'MEDIUM',
    }

    it('formats risk and alerts data in the appropriate format for passing to an RoSH box Nunjucks macro', () => {
      expect(RisksAndAlertsUtils.roshTable(risksAndAlerts)).toEqual({
        classes: 'rosh-table',
        head: [{ text: 'Risk to' }, { text: 'Custody' }, { text: 'Community' }],
        rows: [
          [
            { text: 'Children' },
            { classes: 'rosh-table__cell rosh-table__cell--low', text: 'Low' },
            { classes: 'rosh-table__cell rosh-table__cell--low', text: 'Low' },
          ],
          [
            { text: 'Public' },
            { classes: 'rosh-table__cell rosh-table__cell--low', text: 'Low' },
            { classes: 'rosh-table__cell rosh-table__cell--low', text: 'Low' },
          ],
          [
            { text: 'Known adult' },
            { classes: 'rosh-table__cell rosh-table__cell--high', text: 'High' },
            { classes: 'rosh-table__cell rosh-table__cell--medium', text: 'Medium' },
          ],
          [
            { text: 'Staff' },
            { classes: 'rosh-table__cell rosh-table__cell--medium', text: 'Medium' },
            { classes: 'rosh-table__cell rosh-table__cell--low', text: 'Low' },
          ],
          [
            { text: 'Prisoners' },
            { classes: 'rosh-table__cell rosh-table__cell--low', text: 'Low' },
            { classes: 'rosh-table__cell', text: 'Not applicable' },
          ],
        ],
      })
    })

    describe('when data are missing', () => {
      it('uses "unknown" as the level', () => {
        expect(
          RisksAndAlertsUtils.roshTable({ ...risksAndAlerts, riskChildrenCommunity: undefined }).rows?.find(
            row => row[0].text === 'Children',
          )?.[2],
        ).toEqual({ classes: 'rosh-table__cell rosh-table__cell--unknown', text: 'Unknown' })
      })
    })
  })
})
