import DateUtils from './dateUtils'

describe('DateUtils', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe('calculateAge', () => {
    it('calculates the age in years and months from a date string', () => {
      const mockDateOfBirth = '2000-02-01'
      const mockTodaysDate = new Date('2021-01-01')
      jest.useFakeTimers().setSystemTime(mockTodaysDate)

      expect(DateUtils.calculateAge(mockDateOfBirth)).toEqual({ months: 11, years: 20 })
    })
  })

  describe('govukFormattedFullDateString', () => {
    it('returns todays date as a date string in the format specified by the GOV.UK style guide', () => {
      const mockTodaysDate = new Date('2001-06-04')
      jest.useFakeTimers().setSystemTime(mockTodaysDate)

      expect(DateUtils.govukFormattedFullDateString()).toEqual('4 June 2001')
    })

    describe('when `datestring` is provided', () => {
      it('returns the provided date as a date string in the format specified by the GOV.UK style guide', () => {
        expect(DateUtils.govukFormattedFullDateString('2001-06-03')).toEqual('3 June 2001')
      })
    })
  })

  describe('isoDateOnly', () => {
    it('returns a date string in the format YYYY-MM-DD', () => {
      const mockDate = new Date('2001-06-03')
      expect(DateUtils.isoDateOnly(mockDate)).toEqual('2001-06-03')
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
