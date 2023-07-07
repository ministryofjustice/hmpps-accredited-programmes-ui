/* eslint-disable no-console */
import apiPaths from '../../server/paths/api'
import { stubFor } from '../index'
import { courseOfferings, courses } from '../stubs'

const stubs = []

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      url: apiPaths.courses.index({}),
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
        url: apiPaths.courses.show({ courseId: course.id }),
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
        url: apiPaths.courses.offerings.index({ courseId: course.id }),
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
          url: apiPaths.courses.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id }),
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
