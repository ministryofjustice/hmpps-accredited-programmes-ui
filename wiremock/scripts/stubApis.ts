/* eslint-disable no-console */
import { apiPaths } from '../../server/paths'
import { stubFor } from '../index'
import { courseOfferings, courseParticipations, courses, prisoners } from '../stubs'

const stubs = []

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      url: apiPaths.courses.index({}),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courses,
      status: 200,
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
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: course,
        status: 200,
      },
    }),
  )

  stubs.push(async () =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.offerings({ courseId: course.id }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: courseOfferings,
        status: 200,
      },
    }),
  )
})

courseOfferings.forEach(courseOffering => {
  stubs.push(async () =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.offerings.show({ courseOfferingId: courseOffering.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseOffering,
        status: 200,
      },
    }),
  )

  stubs.push(async () =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.offerings.course({ courseOfferingId: courseOffering.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courses[0],
        status: 200,
      },
    }),
  )
})

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      url: apiPaths.people.participations({ prisonNumber: prisoners[1].prisonerNumber }),
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: courseParticipations,
      status: 200,
    },
  }),
)

console.log('Stubbing APIs')

stubs.forEach(stub =>
  stub().then(response => {
    console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
  }),
)
