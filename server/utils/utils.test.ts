import { convertToTitleCase, initialiseName, initialiseTitle } from './utils'

describe('utils', () => {
  describe('convertToTitleCase', () => {
    it.each([
      [null, null, ''],
      ['empty string', '', ''],
      ['Lower case', 'robert', 'Robert'],
      ['Upper case', 'ROBERT', 'Robert'],
      ['Mixed case', 'RoBErT', 'Robert'],
      ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
      ['Leading spaces', '  RobeRT', '  Robert'],
      ['Trailing spaces', 'RobeRT  ', 'Robert  '],
      ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
    ])('%s convertToTitleCase(%s, %s)', (_inputType: string | null, input: string | null, expectedOutput: string) => {
      expect(convertToTitleCase(input)).toEqual(expectedOutput)
    })
  })

  describe('initialiseName', () => {
    it.each([
      [undefined, undefined, null],
      ['Empty string', '', null],
      ['One word', 'robert', 'r. robert'],
      ['Two words', 'Robert James', 'R. James'],
      ['Three words', 'Robert James Smith', 'R. Smith'],
      ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
    ])(
      '%s initialiseName(%s, %s)',
      (_inputType: string | undefined, input: string | undefined, expectedOutput: string | null) => {
        expect(initialiseName(input)).toEqual(expectedOutput)
      },
    )
  })

  describe('intitialiseTitle', () => {
    it.each([
      ['One word', 'Lime', 'L'],
      ['Two words', 'Lime Course', 'LC'],
      ['Hyphenated word', 'Lime-course', 'L'],
      ['Mixed case word', 'LimeCourse', 'L'],
    ])('%s initialiseTitle(%s, %s)', (_inputType: string, input: string, expectedOutput: string) => {
      expect(initialiseTitle(input)).toEqual(expectedOutput)
    })
  })
})
