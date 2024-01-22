import RisksAndAlertsUtils from './risksAndAlertsUtils'

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
})
