import dateUtils from './dateUtils'

describe('dateUtils', () => {
  describe('govukFormattedFullDateString', () => {
    it('returns a date string in the format specified by the GOV.UK style guide', () => {
      expect(dateUtils.govukFormattedFullDateString('2001-06-03')).toEqual('3 June 2001')
    })
  })
})
