import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import type { Response } from 'express'

import { caseloadFactory } from './factories'

export default class Helpers {
  // The error an API client (@ministryofjustice/hmpps-rest-client) throws when a request fails
  static createApiError(responseStatus: number, message = `Error ${responseStatus}`): SanitisedError {
    return Object.assign(new SanitisedError(message), { responseStatus })
  }

  static createMockResponseWithCaseloads(): DeepMocked<Response> {
    return createMock<Response>({
      locals: {
        user: {
          caseloads: [caseloadFactory.build()],
        },
      },
    })
  }
}
