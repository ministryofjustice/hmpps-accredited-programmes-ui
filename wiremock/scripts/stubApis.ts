/* eslint-disable no-console */
import { apiPaths } from '../../server/paths'
import { stubFor } from '../index'
import organizations from '../linkage/organizations.json'
import { courseOfferings, courseParticipations, courses, prisoners, referrals } from '../stubs'
import referralSummaries from '../stubs/referralSummaries.json'

const stubs = []

organizations.forEach(({ id: organisationId, courses: myCourses }) => {
  stubs.push(
    // organisation/:orgId/courses
    () =>
      stubFor({
        request: {
          method: 'GET',
          url: apiPaths.organisations.courses({ organisationId }),
        },
        response: {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: myCourses.map(courseId => courses.find(course => courseId === course.id)),
          status: 200,
        },
      }),
    // referral/organisation/:orgId/dashboard
    () =>
      stubFor({
        request: {
          method: 'GET',
          url: apiPaths.referrals.dashboard({ organisationId }),
        },
        response: {
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: {
            content: referrals,
            pageIsEmpty: false,
            pageNumber: 1,
            pageSize: 100,
            totalElements: referrals.length,
            totalPages: 1,
          },
          status: 200,
        },
      }),
    // courses
    ...myCourses.map(myCourseId => {
      const myCourseData = courses.find(course => myCourseId === course.id)

      if (!myCourseData) {
        throw new Error(`CourseID ${myCourseId} doesn't exist for organisation`)
      }

      const myReferrals = referralSummaries.filter(({ courseName }) => courseName === myCourseData.name)

      // organisation/:orgId/courses?courseName=...
      return () =>
        stubFor({
          request: {
            method: 'GET',
            url: `${apiPaths.referrals.dashboard({ organisationId })}?courseName=${encodeURIComponent(
              myCourseData.name,
            )}&size=999`,
          },
          response: {
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
            },
            jsonBody: {
              content: myReferrals,
              pageIsEmpty: false,
              pageNumber: 1,
              pageSize: 100,
              totalElements: myReferrals.length,
              totalPages: 1,
            },
            status: 200,
          },
        })
    }),
  )
})

stubs.push(() =>
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
  stubs.push(() =>
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

  stubs.push(() =>
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
  stubs.push(() =>
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

  stubs.push(() =>
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

stubs.push(() =>
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

referrals.forEach(referral => {
  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referrals.show({ referralId: referral.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referral,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'PUT',
        url: apiPaths.referrals.update({ referralId: referral.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 204,
      },
    }),
  )
})

console.log('Stubbing APIs')

stubs.forEach(stub =>
  stub().then(response => {
    console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
  }),
)
