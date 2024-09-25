import type { SanitisedError, UnsanitisedError } from './sanitisedError'
import sanitiseError, { isErrorWithData } from './sanitisedError'

describe('sanitiseError', () => {
  it('returns an error without the request headers', () => {
    const error = {
      message: 'Not Found',
      name: '',
      response: {
        body: { content: 'hello' },
        headers: {
          date: 'Tue, 19 May 2020 15:16:20 GMT',
        },
        req: {
          headers: {
            property: 'not for logging',
          },
          method: 'GET',
          url: 'https://test-api/endpoint?active=true',
        },
        status: 404,
        statusText: 'Not Found',
        text: { details: 'details' },
      },
      stack: 'stack description',
      status: 404,
    } as unknown as UnsanitisedError

    const sanitisedError = new Error() as SanitisedError
    sanitisedError.data = { content: error.response?.body.content }
    sanitisedError.headers = { date: error.response?.headers.date }
    sanitisedError.message = error.message
    sanitisedError.stack = error.stack
    sanitisedError.status = error.status
    sanitisedError.text = error.response?.text

    expect(sanitiseError(error)).toEqual(sanitisedError)
  })

  describe("when there's no response", () => {
    it('returns an error with just the message and stack', () => {
      const error = {
        message: 'error description',
        name: '',
        stack: 'stack description',
        status: 404,
      } as unknown as UnsanitisedError

      const sanitisedError = new Error() as SanitisedError
      sanitisedError.message = error.message
      sanitisedError.stack = error.stack

      expect(sanitiseError(error)).toEqual(sanitisedError)
    })
  })
})

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
