import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'

import FormUtils from './formUtils'

describe('FormUtils', () => {
  describe('setFieldErrors', () => {
    const request = createMock<Request>({})
    const response = createMock<Response>({})

    it("adds errors to a response's locals for displaying in the UI", () => {
      const someFieldErrorMessage = 'You must fill in some field'
      const someOtherFieldErrorMessage = 'Some other field is invalid'

      ;(request.flash as jest.Mock).mockImplementation((message: string) => {
        return {
          someFieldError: [someFieldErrorMessage],
          someOtherFieldError: [someOtherFieldErrorMessage],
        }[message]
      })

      FormUtils.setFieldErrors(request, response, ['someField', 'someOtherField'])

      expect(response.locals.errors).toEqual({
        list: [
          {
            href: '#someField',
            text: someFieldErrorMessage,
          },
          {
            href: '#someOtherField',
            text: someOtherFieldErrorMessage,
          },
        ],
        messages: { someField: { text: someFieldErrorMessage }, someOtherField: { text: someOtherFieldErrorMessage } },
      })
    })

    describe('when there are no flashed error messages', () => {
      it("doesn't add any errors to a response's locals", () => {
        ;(request.flash as jest.Mock).mockImplementation((_message: string) => [])

        FormUtils.setFieldErrors(request, response, ['someField', 'someOtherField'])

        expect(response.locals.errors).toEqual({
          list: [],
          messages: {},
        })
      })
    })
  })
})
