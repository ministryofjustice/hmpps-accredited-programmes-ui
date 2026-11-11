import type { SanitisedError } from '@ministryofjustice/hmpps-rest-client'

export function isErrorWithData<T>(error: unknown): error is SanitisedError<T> & { data: T } {
  return (error as SanitisedError).data !== undefined
}

export type { SanitisedError }
