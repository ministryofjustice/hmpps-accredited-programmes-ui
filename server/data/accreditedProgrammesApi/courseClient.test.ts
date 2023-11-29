import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import CourseClient from './courseClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  courseParticipationOutcomeFactory,
} from '../../testutils/factories'
import type { CourseParticipationUpdate } from '@accredited-programmes/models'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let courseClient: CourseClient

  const systemToken = 'token-1'

  beforeEach(() => {
    courseClient = new CourseClient(systemToken)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  describe('all', () => {
    const courses = [
      courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' }),
      courseFactory.build({ id: '28e47d30-30bf-4dab-a8eb-9fda3f6400e8' }),
      courseFactory.build({ id: '1811faa6-d568-4fc4-83ce-41118b90242e' }),
    ]

    beforeEach(() => {
      provider.addInteraction({
        state:
          'Courses d3abc217-75ee-46e9-a010-368f30282367, 28e47d30-30bf-4dab-a8eb-9fda3f6400e8, and 1811faa6-d568-4fc4-83ce-41118b90242e and no others exist',
        uponReceiving: 'A request for all courses',
        willRespondWith: {
          body: Matchers.like(courses),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.courses.index({}),
        },
      })
    })

    it('fetches all courses', async () => {
      const result = await courseClient.all()

      expect(result).toEqual(courses)
    })
  })

  describe('createParticipation', () => {
    const courseParticipation = courseParticipationFactory.new().build()
    const { courseName, prisonNumber } = courseParticipation

    beforeEach(() => {
      provider.addInteraction({
        state: 'A participation can be created',
        uponReceiving: 'A request to create a participation',
        willRespondWith: {
          body: Matchers.like(courseParticipation),
          status: 201,
        },
        withRequest: {
          body: { courseName, prisonNumber },
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'POST',
          path: apiPaths.participations.create({}),
        },
      })
    })

    it('creates a participation for the given person', async () => {
      const result = await courseClient.createParticipation(prisonNumber, courseName)

      expect(result).toEqual(courseParticipation)
    })
  })

  describe('destroyParticipation', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Participation 882a5a16-bcb8-4d8b-9692-a3006dcecffb exists',
        uponReceiving: 'A request to destroy participation 882a5a16-bcb8-4d8b-9692-a3006dcecffb',
        willRespondWith: {
          status: 204,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'DELETE',
          path: apiPaths.participations.delete({ courseParticipationId: '882a5a16-bcb8-4d8b-9692-a3006dcecffb' }),
        },
      })
    })

    it('destroys the given participation', async () => {
      await courseClient.destroyParticipation('882a5a16-bcb8-4d8b-9692-a3006dcecffb')
    })
  })

  describe('find', () => {
    const course = courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' })

    beforeEach(() => {
      provider.addInteraction({
        state: 'Course d3abc217-75ee-46e9-a010-368f30282367 exists',
        uponReceiving: 'A request for course d3abc217-75ee-46e9-a010-368f30282367',
        willRespondWith: {
          body: Matchers.like(course),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.courses.show({ courseId: 'd3abc217-75ee-46e9-a010-368f30282367' }),
        },
      })
    })

    it('fetches the given course', async () => {
      const result = await courseClient.find('d3abc217-75ee-46e9-a010-368f30282367')

      expect(result).toEqual(course)
    })
  })

  describe('findCourseByOffering', () => {
    const course = courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' })

    beforeEach(() => {
      provider.addInteraction({
        state: 'Offering 790a2dfe-7de5-4504-bb9c-83e6e53a6537 exists for course d3abc217-75ee-46e9-a010-368f30282367',
        uponReceiving: "A request for offering 790a2dfe-7de5-4504-bb9c-83e6e53a6537's course",
        willRespondWith: {
          body: Matchers.like(course),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.offerings.course({ courseOfferingId: '790a2dfe-7de5-4504-bb9c-83e6e53a6537' }),
        },
      })
    })

    it("fetches the given offering's course", async () => {
      const result = await courseClient.findCourseByOffering('790a2dfe-7de5-4504-bb9c-83e6e53a6537')

      expect(result).toEqual(course)
    })
  })

  describe('findCourseNames', () => {
    const courseNames = ['Super Course', 'Custom Course', 'RAPID Course']

    beforeEach(() => {
      provider.addInteraction({
        state: 'In order, the names of all the courses are Super Course, Custom Course, and RAPID Course',
        uponReceiving: 'A request for all course names',
        willRespondWith: {
          body: Matchers.like(courseNames),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.courses.names({}),
        },
      })
    })

    it('fetches all course names', async () => {
      const result = await courseClient.findCourseNames()

      expect(result).toEqual(courseNames)
    })
  })

  describe('findOfferings', () => {
    const courseOfferings = [
      courseOfferingFactory.build({ id: '790a2dfe-7de5-4504-bb9c-83e6e53a6537' }),
      courseOfferingFactory.build({
        id: '7fffcc6a-11f8-4713-be35-cf5ff1aee517',
        secondaryContactEmail: 'nobody2-mdi@digital.justice.gov.uk',
      }),
    ]

    beforeEach(() => {
      provider.addInteraction({
        state:
          'Course d3abc217-75ee-46e9-a010-368f30282367 has offerings 790a2dfe-7de5-4504-bb9c-83e6e53a6537 and 7fffcc6a-11f8-4713-be35-cf5ff1aee517',
        uponReceiving: "A request for course d3abc217-75ee-46e9-a010-368f30282367's offerings",
        willRespondWith: {
          body: Matchers.like(courseOfferings),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.courses.offerings({ courseId: 'd3abc217-75ee-46e9-a010-368f30282367' }),
        },
      })
    })

    it("fetches the given course's offerings", async () => {
      const result = await courseClient.findOfferings('d3abc217-75ee-46e9-a010-368f30282367')

      expect(result).toEqual(courseOfferings)
    })
  })

  describe('findOffering', () => {
    const courseOffering = courseOfferingFactory.build({ id: '790a2dfe-7de5-4504-bb9c-83e6e53a6537' })

    beforeEach(() => {
      provider.addInteraction({
        state: 'Offering 790a2dfe-7de5-4504-bb9c-83e6e53a6537 exists',
        uponReceiving: 'A request for offering 790a2dfe-7de5-4504-bb9c-83e6e53a6537',
        willRespondWith: {
          body: Matchers.like(courseOffering),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.offerings.show({ courseOfferingId: '790a2dfe-7de5-4504-bb9c-83e6e53a6537' }),
        },
      })
    })

    it('fetches the given offering', async () => {
      const result = await courseClient.findOffering('790a2dfe-7de5-4504-bb9c-83e6e53a6537')

      expect(result).toEqual(courseOffering)
    })
  })

  describe('findParticipation', () => {
    const courseParticipation = courseParticipationFactory.build({ id: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004' })

    beforeEach(() => {
      provider.addInteraction({
        state: 'Participation 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004 exists',
        uponReceiving: 'A request for participation 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004',
        willRespondWith: {
          body: Matchers.like(courseParticipation),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.participations.show({ courseParticipationId: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004' }),
        },
      })
    })

    it('fetches the given participation', async () => {
      const result = await courseClient.findParticipation('0cff5da9-1e90-4ee2-a5cb-94dc49c4b004')

      expect(result).toEqual(courseParticipation)
    })
  })

  describe('findParticipationsByPerson', () => {
    const courseParticipations = [
      courseParticipationFactory.build({
        id: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004',
        outcome: courseParticipationOutcomeFactory.complete().build(),
        prisonNumber: 'A1234AA',
      }),
      courseParticipationFactory.build({
        id: 'eb357e5d-5416-43bf-a8d2-0dc8fd92162e',
        outcome: courseParticipationOutcomeFactory.incomplete().build(),
        prisonNumber: 'A1234AA',
      }),
    ]

    beforeEach(() => {
      provider.addInteraction({
        state:
          'Person A1234AA has participations 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004 and eb357e5d-5416-43bf-a8d2-0dc8fd92162e and no others',
        uponReceiving: "A request for person A1234AA's participations",
        willRespondWith: {
          body: Matchers.like(courseParticipations),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.people.participations({ prisonNumber: 'A1234AA' }),
        },
      })
    })

    it("fetches the given person's participations", async () => {
      const result = await courseClient.findParticipationsByPerson('A1234AA')

      expect(result).toEqual(courseParticipations)
    })
  })

  describe('updateParticipation', () => {
    const courseParticipation = courseParticipationFactory.build({ id: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004' })
    const courseParticipationUpdate: CourseParticipationUpdate = {
      courseName: 'learnings that are good',
      detail: 'nice',
      outcome: {
        status: 'complete',
        yearCompleted: 2023,
      },
      setting: {
        location: 'somewhere',
        type: 'community',
      },
      source: 'somewhere',
    }
    const updatedCourseParticipation = { ...courseParticipation, ...courseParticipationUpdate }

    beforeEach(() => {
      provider.addInteraction({
        state: 'Participation 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004 exists',
        uponReceiving: 'A request to update participation 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004',
        willRespondWith: {
          body: Matchers.like(updatedCourseParticipation),
          status: 200,
        },
        withRequest: {
          body: courseParticipationUpdate,
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'PUT',
          path: apiPaths.participations.update({ courseParticipationId: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004' }),
        },
      })
    })

    it('updates the given participation', async () => {
      const result = await courseClient.updateParticipation(
        '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004',
        courseParticipationUpdate,
      )

      expect(result).toEqual(updatedCourseParticipation)
    })
  })
})
