import stringUtils from './stringUtils'

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
      expect(stringUtils.convertToTitleCase(input)).toEqual(expectedOutput)
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
        expect(stringUtils.initialiseName(input)).toEqual(expectedOutput)
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
      expect(stringUtils.initialiseTitle(input)).toEqual(expectedOutput)
    })
  })
})
