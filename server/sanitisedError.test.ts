import type { UnsanitisedError } from './sanitisedError'
import sanitiseError from './sanitisedError'

describe('sanitiseError', () => {
  it('omits the request headers from the error object ', () => {
    const error = {
      name: '',
      status: 404,
      response: {
        req: {
          method: 'GET',
          url: 'https://test-api/endpoint?active=true',
          headers: {
            property: 'not for logging',
          },
        },
        headers: {
          date: 'Tue, 19 May 2020 15:16:20 GMT',
        },
        status: 404,
        statusText: 'Not Found',
        text: { details: 'details' },
        body: { content: 'hello' },
      },
      message: 'Not Found',
      stack: 'stack description',
    } as unknown as UnsanitisedError

    expect(sanitiseError(error)).toEqual({
      headers: { date: 'Tue, 19 May 2020 15:16:20 GMT' },
      message: 'Not Found',
      stack: 'stack description',
      status: 404,
      text: { details: 'details' },
      data: { content: 'hello' },
    })
  })

  it('returns the error message', () => {
    const error = {
      message: 'error description',
    } as unknown as UnsanitisedError
    expect(sanitiseError(error)).toEqual({
      message: 'error description',
    })
  })

  it('returns an empty object for an unknown error structure', () => {
    const error = {
      property: 'unknown',
    } as unknown as UnsanitisedError
    expect(sanitiseError(error)).toEqual({})
  })
})
