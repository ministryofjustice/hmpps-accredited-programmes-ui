import RisksAndAlertsUtils from './risksAndAlertsUtils'
import type { RisksAndAlerts } from '@accredited-programmes/models'

describe('RisksAndAlertsUtils', () => {
  describe('ospBox', () => {
    it('formats OSP data in the appropriate format for passing to an OSP box Nunjucks macro', () => {
      expect(RisksAndAlertsUtils.ospBox('OSP/C', 'VERY_HIGH')).toEqual({
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
