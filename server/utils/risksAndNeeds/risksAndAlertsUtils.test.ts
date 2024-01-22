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
})
