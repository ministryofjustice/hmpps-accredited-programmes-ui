/* eslint-disable no-console */
import { stubFor } from './index'
import courses from './stubs/courses.json'

const stubs = []

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      url: '/programmes',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courses,
    },
  }),
)

console.log('Stubbing APIs')

stubs.forEach(s =>
  s().then(response => {
    console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
  }),
)
