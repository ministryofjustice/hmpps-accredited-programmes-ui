/* eslint-disable no-param-reassign */
import type { Express } from 'express'

import config from '../config'

export default function setUpEnvironmentName(app: Express) {
  app.locals.environmentName = config.environment
  app.locals.environmentNameColour = config.environment === 'preprod' ? 'govuk-tag--green' : ''
}
