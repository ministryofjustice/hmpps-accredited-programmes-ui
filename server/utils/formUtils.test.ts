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

  describe('getSelectItems', () => {
    const items = { optionA: 'Option A', optionB: 'Option B' }

    it('marks the Select option as selected and formats the options in the appropriate format for passing to a GOV.UK Select nunjucks macro', () => {
      expect(FormUtils.getSelectItems(items)).toEqual([
        { selected: true, text: 'Select', value: '' },
        { selected: false, text: 'Option A', value: 'optionA' },
        { selected: false, text: 'Option B', value: 'optionB' },
      ])
    })

    describe('when a selected value is provided', () => {
      it('marks the selected value as selected and formats the options in the appropriate format for passing to a GOV.UK Select nunjucks macro', () => {
        expect(FormUtils.getSelectItems(items, 'optionB')).toEqual([
          { selected: false, text: 'Select', value: '' },
          { selected: false, text: 'Option A', value: 'optionA' },
          { selected: true, text: 'Option B', value: 'optionB' },
        ])
      })
    })

    describe('when the placeholder should be hidden', () => {
      it('formats the options in the appropriate format for passing to a GOV.UK Select nunjucks macro without a placeholder', () => {
        expect(FormUtils.getSelectItems(items, undefined, true)).toEqual([
          { selected: false, text: 'Option A', value: 'optionA' },
          { selected: false, text: 'Option B', value: 'optionB' },
        ])
      })
    })
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
    describe('when there are default values', () => {
      const defaultFormValues = { someField: 'some original value', someOtherField: 'some other original value' }

      it('adds the default values to response locals', () => {
        ;(request.flash as jest.Mock).mockImplementation(() => [])
        FormUtils.setFormValues(request, response, defaultFormValues)

        expect(response.locals.formValues).toEqual(defaultFormValues)
      })

      describe('but there are also flashed form values', () => {
        it('adds the flashed form values instead of the default values to the response locals', () => {
          const formValues = { someField: 'some updated value', someOtherField: 'some other updated value' }
          ;(request.flash as jest.Mock).mockImplementation(() => [JSON.stringify(formValues)])

          FormUtils.setFormValues(request, response, defaultFormValues)

          expect(response.locals.formValues).toEqual(formValues)
        })
      })
    })

    describe('when there are no flashed form or default values', () => {
      it("doesn't add any form values to the response locals", () => {
        ;(request.flash as jest.Mock).mockImplementation(() => [])

        FormUtils.setFormValues(request, response)

        expect(response.locals.formValues).toEqual({})
      })
    })
  })
})
