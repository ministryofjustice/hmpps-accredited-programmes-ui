import type { SanitisedError } from './sanitisedError'
import { isErrorWithData } from './sanitisedError'

describe('isErrorWithData', () => {
  it('returns true if the error has data', () => {
    const error = {
      data: 'data',
      message: 'message',
      stack: 'stack',
    } as SanitisedError

    expect(isErrorWithData(error)).toBe(true)
  })

  it('returns false if the error does not have data', () => {
    const error = {
      message: 'message',
      stack: 'stack',
    } as SanitisedError

    expect(isErrorWithData(error)).toBe(false)
  })
})
