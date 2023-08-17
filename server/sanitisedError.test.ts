import type { UnsanitisedError } from './sanitisedError'
import sanitiseError from './sanitisedError'

describe('sanitiseError', () => {
  it('omits the request headers from the error object ', () => {
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

    expect(sanitiseError(error)).toEqual({
      data: { content: 'hello' },
      headers: { date: 'Tue, 19 May 2020 15:16:20 GMT' },
      message: 'Not Found',
      stack: 'stack description',
      status: 404,
      text: { details: 'details' },
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
