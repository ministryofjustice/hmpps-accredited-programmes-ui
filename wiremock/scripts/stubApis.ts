/* eslint-disable no-console */
import paths from '../../server/paths/api'
import { stubFor } from '../index'
import { courseOfferings, courses } from '../stubs'

const stubs = []

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      url: paths.courses.index({}),
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

courses.forEach(course => {
  stubs.push(async () =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.courses.show({ id: course.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: course,
      },
    }),
  )

  stubs.push(async () =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.courses.offerings.index({ id: course.id }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: courseOfferings,
      },
    }),
  )

  courseOfferings.forEach(courseOffering => {
    stubs.push(async () =>
      stubFor({
        request: {
          method: 'GET',
          url: paths.courses.offerings.show({ id: course.id, courseOfferingId: courseOffering.id }),
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: courseOffering,
        },
      }),
    )
  })
})

console.log('Stubbing APIs')

stubs.forEach(stub =>
  stub().then(response => {
    console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
  }),
)
