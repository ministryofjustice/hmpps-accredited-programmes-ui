import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { Response } from 'express'

import { caseloadFactory } from './factories'

export default class Helpers {
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
