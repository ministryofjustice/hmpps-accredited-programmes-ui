import type { ResponseError } from 'superagent'

interface SanitisedError {
  message: string
  stack: string | undefined
  data?: unknown
  headers?: unknown
  status?: number
  text?: string
}

export type UnsanitisedError = ResponseError

export default function sanitiseError(error: UnsanitisedError): SanitisedError {
  if (error.response) {
    return {
      data: error.response.body,
      headers: error.response.headers,
      message: error.message,
      stack: error.stack,
      status: error.response.status,
      text: error.response.text,
    }
  }
  return {
    message: error.message,
    stack: error.stack,
  }
}
