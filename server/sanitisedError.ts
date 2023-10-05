import type { ResponseError } from 'superagent'

type UnsanitisedError = ResponseError

type SanitisedError = Error & {
  message: string
  stack: string | undefined
  data?: unknown
  headers?: unknown
  status?: number
  text?: string
}

export default function sanitiseError(error: UnsanitisedError): SanitisedError {
  const sanitisedError = new Error() as SanitisedError
  sanitisedError.message = error.message
  sanitisedError.stack = error.stack

  if (error.response) {
    sanitisedError.data = error.response.body
    sanitisedError.headers = error.response.headers
    sanitisedError.status = error.response.status
    sanitisedError.text = error.response.text
  }

  return sanitisedError
}

export type { SanitisedError, UnsanitisedError }
