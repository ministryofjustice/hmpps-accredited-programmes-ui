import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'

import FormUtils from './formUtils'

describe('FormUtils', () => {
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>

  beforeEach(() => {
    request = createMock<Request>({})
    response = createMock<Response>({})
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('setFieldErrors', () => {
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

  describe('setFormValues', () => {
    it("adds form values to a response's locals for displaying in the UI", () => {
      const formValues = { someField: 'some value', someOtherField: 'some other value' }
      ;(request.flash as jest.Mock).mockImplementation(() => [JSON.stringify(formValues)])

      FormUtils.setFormValues(request, response)

      expect(response.locals.formValues).toEqual(formValues)
    })

    describe('when there are no flashed form values', () => {
      it("doesn't add any form values to a response's locals", () => {
        ;(request.flash as jest.Mock).mockImplementation(() => [])

        FormUtils.setFormValues(request, response)

        expect(response.locals.formValues).toEqual({})
      })
    })
  })
})
