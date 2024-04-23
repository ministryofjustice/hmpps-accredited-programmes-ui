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

  describe('removeTimezoneOffset', () => {
    describe('for a date before British Summer Time (BST)', () => {
      it('returns an unchanged ISO date string', () => {
        const dateBeforeBST = '2017-03-23T10:25:30.000Z'
        expect(DateUtils.removeTimezoneOffset(dateBeforeBST)).toEqual('2017-03-23T10:25:30.000Z')
      })
    })

    describe('for a date during British Summer Time (BST)', () => {
      it('returns an ISO date string with 1 hour removed', () => {
        const dateDuringBST = '2017-04-23T10:25:30.000Z'
        expect(DateUtils.removeTimezoneOffset(dateDuringBST)).toEqual('2017-04-23T09:25:30.000Z')
      })
    })
  })
})
