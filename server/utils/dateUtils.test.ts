import DateUtils from './dateUtils'

describe('DateUtils', () => {
  describe('govukFormattedFullDateString', () => {
    it('returns todays date as a date string in the format specified by the GOV.UK style guide', () => {
      const mockTodaysDate = new Date('2001-06-04')
      jest.spyOn(global, 'Date').mockImplementation(() => mockTodaysDate)

      expect(DateUtils.govukFormattedFullDateString()).toEqual('4 June 2001')

      jest.spyOn(global, 'Date').mockRestore()
    })

    describe('when `datestring` is provided', () => {
      it('returns the provided date as a date string in the format specified by the GOV.UK style guide', () => {
        expect(DateUtils.govukFormattedFullDateString('2001-06-03')).toEqual('3 June 2001')
      })
    })
  })
})
