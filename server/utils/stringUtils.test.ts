import StringUtils from './stringUtils'

describe('StringUtils', () => {
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
      expect(StringUtils.convertToTitleCase(input)).toEqual(expectedOutput)
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
        expect(StringUtils.initialiseName(input)).toEqual(expectedOutput)
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
      expect(StringUtils.initialiseTitle(input)).toEqual(expectedOutput)
    })
  })

  describe('makePossessive', () => {
    it.each([
      ['a word ending in s', 'James', "James'"],
      ['a word not ending in s', 'Jameson', "Jameson's"],
    ])('handles %s: %s -> %s', (_inputType: string, input: string, expectedOutput: string) => {
      expect(StringUtils.makePossessive(input)).toEqual(expectedOutput)
    })
  })

  describe('pluralise', () => {
    it.each([
      ['one item', 'item', 1, 'item'],
      ['multiple items', 'item', 2, 'items'],
    ])('handles %s: %s -> %s', (_inputType: string, word: string, count: number, expectedOutput: string) => {
      expect(StringUtils.pluralise(word, count)).toEqual(expectedOutput)
    })
  })

  describe('properCase', () => {
    it.each([
      ['an empty string', '', ''],
      ['a single lower case letter', 'a', 'A'],
      ['a single upper case letter', 'A', 'A'],
      ['a lower case word', 'rosa', 'Rosa'],
      ['an upper case word', 'ROSA', 'Rosa'],
      ['a proper case word', 'Rosa', 'Rosa'],
      ['a mixed case word', 'RoSa', 'Rosa'],
      ['multiple words', 'the fish swam', 'The fish swam'],
    ])('handles %s: %s -> %s', (_inputType: string, input: string, expectedOutput: string) => {
      expect(StringUtils.properCase(input)).toEqual(expectedOutput)
    })
  })
})
