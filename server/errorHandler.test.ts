import express, { type Express } from 'express'
import createError from 'http-errors'
import path from 'path'
import request from 'supertest'

import errorHandler from './errorHandler'
import { nunjucksSetup } from './utils'

const setupApp = (production: boolean): Express => {
  const app = express()
  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.get('/known', (_req, res, _next) => {
    res.send('known')
  })
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  describe('when in dev mode', () => {
    it('renders content with the stack trace', () => {
      const app = setupApp(false)

      return request(app)
        .get('/unknown')
        .expect(404)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('NotFoundError: Not found')
          expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
        })
    })
  })

  describe('when in production mode', () => {
    it('renders content without the stack trace', () => {
      const app = setupApp(true)

      return request(app)
        .get('/unknown')
        .expect(404)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
          expect(res.text).not.toContain('NotFoundError: Not found')
        })
    })
  })
})
