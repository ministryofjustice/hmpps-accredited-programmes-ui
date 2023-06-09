import { convertToTitleCase, initialiseName } from './utils'

describe('convert to title case', () => {
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

describe('initialise name', () => {
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
