import { convertToTitleCase, initialiseName, initialiseTitle, paginatedArray } from './utils'

describe('utils', () => {
  describe('convertToTitleCase', () => {
    it.each([
      [null, null, ''],
      ['an empty string', '', ''],
      ['lower case', 'robert', 'Robert'],
      ['upper case', 'ROBERT', 'Robert'],
      ['mixed case', 'RoBErT', 'Robert'],
      ['multiple words', 'RobeRT SMiTH', 'Robert Smith'],
      ['leading spaces', '  RobeRT', '  Robert'],
      ['trailing spaces', 'RobeRT  ', 'Robert  '],
      ['hyphenation', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
    ])('handles %s: %s -> %s', (_inputType: string | null, input: string | null, expectedOutput: string) => {
      expect(convertToTitleCase(input)).toEqual(expectedOutput)
    })
  })

  describe('initialiseName', () => {
    it.each([
      [undefined, undefined, null],
      ['an empty string', '', null],
      ['one name', 'robert', 'r. robert'],
      ['two names', 'Robert James', 'R. James'],
      ['three names', 'Robert James Smith', 'R. Smith'],
      ['double-barrelled names', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
    ])(
      'handles %s: %s -> %s',
      (_inputType: string | undefined, input: string | undefined, expectedOutput: string | null) => {
        expect(initialiseName(input)).toEqual(expectedOutput)
      },
    )
  })

  describe('intitialiseTitle', () => {
    it.each([
      ['one word', 'Lime', 'L'],
      ['two words', 'Lime Course', 'LC'],
      ['a hyphenated word', 'Lime-course', 'L'],
      ['a mixed case word', 'LimeCourse', 'L'],
    ])('handles %s: %s -> %s', (_inputType: string, input: string, expectedOutput: string) => {
      expect(initialiseTitle(input)).toEqual(expectedOutput)
    })
  })

  describe('paginatedArray', () => {
    const arrayOfMoreThanTenItems = [...Array(15).keys()]

    describe('when passed an array of more then 10 items', () => {
      describe('and no page', () => {
        it('returns a `PaginatedArray` including a slice of the array corresponding to the first page', () => {
          expect(paginatedArray(arrayOfMoreThanTenItems)).toEqual({
            page: 1,
            totalItems: 15,
            items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          })
        })

        describe('and a non-first page', () => {
          it('returns a `PaginatedArray` including a slice of the array corresponding to the given page', () => {
            expect(paginatedArray(arrayOfMoreThanTenItems, 2)).toEqual({
              page: 2,
              totalItems: 15,
              items: [10, 11, 12, 13, 14],
            })
          })
        })
      })
    })

    describe('when passed an array of 10 or fewer items', () => {
      it('returns a `PaginatedArray` including the original array', () => {
        const arrayOfTenOrFewerItems = [...Array(9).keys()]

        expect(paginatedArray(arrayOfTenOrFewerItems)).toEqual({
          page: 1,
          totalItems: 9,
          items: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        })
      })
    })

    describe('when passed a page with no corresponding items', () => {
      it('returns a `PaginatedArray` with no items', () => {
        expect(paginatedArray(arrayOfMoreThanTenItems, 3)).toEqual({
          page: 3,
          totalItems: 15,
          items: [],
        })
      })
    })
  })
})
