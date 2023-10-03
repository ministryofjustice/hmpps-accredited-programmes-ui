import type { Request, Response } from 'express'

import type { GovukFrontendErrorMessage, GovukFrontendErrorSummaryErrorListElement } from '@govuk-frontend'

export default class FormUtils {
  static setFieldErrors(req: Request, res: Response, fields: Array<string>): void {
    const list: Array<GovukFrontendErrorSummaryErrorListElement> = []
    const messages: Record<string, GovukFrontendErrorMessage> = {}

    fields.forEach(field => {
      const errorMessage = req.flash(`${field}Error`)[0]

      if (errorMessage) {
        list.push({ href: `#${field}`, text: errorMessage })
        messages[field] = { text: errorMessage }
      }
    })

    res.locals.errors = { list, messages }
  }

  static setFormValues(req: Request, res: Response): void {
    const formValuesAsString = req.flash('formValues')[0]

    const formValues = formValuesAsString ? JSON.parse(formValuesAsString) : {}

    res.locals.formValues = formValues
  }
}
