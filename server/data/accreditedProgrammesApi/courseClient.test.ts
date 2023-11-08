import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import CourseClient from './courseClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  personFactory,
} from '../../testutils/factories'
import type { CourseParticipationUpdate } from '@accredited-programmes/models'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let courseClient: CourseClient

  const token = 'token-1'

  beforeEach(() => {
    courseClient = new CourseClient(token)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  const course1 = courseFactory.build({
    id: 'd3abc217-75ee-46e9-a010-368f30282367', // eslint-disable-next-line sort-keys
    alternateName: 'AC++',
  })
  const course2 = courseFactory.build({
    id: '28e47d30-30bf-4dab-a8eb-9fda3f6400e8', // eslint-disable-next-line sort-keys
    alternateName: 'LC',
  })
  const course3 = courseFactory.build({
    id: '1811faa6-d568-4fc4-83ce-41118b90242e', // eslint-disable-next-line sort-keys
    alternateName: null,
  })
  const allCourses = [course1, course2, course3]
  const courseOffering1 = courseOfferingFactory.build({
    id: '7fffcc6a-11f8-4713-be35-cf5ff1aee517', // eslint-disable-next-line sort-keys
    secondaryContactEmail: 'nobody2-mdi@digital.justice.gov.uk',
  })
  const courseOffering2 = courseOfferingFactory.build({
    id: '790a2dfe-7de5-4504-bb9c-83e6e53a6537',
  })
  const courseOffering3 = courseOfferingFactory.build({
    id: '39b77a2f-7398-4d5f-b744-cdcefca12671',
  })
  const allCourseOfferings = [courseOffering1, courseOffering2, courseOffering3]
  const person = personFactory.build({ prisonNumber: 'A1234AA' })
  const courseParticipations = [
    courseParticipationFactory.build({ id: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004', prisonNumber: person.prisonNumber }),
    courseParticipationFactory.build({ id: '9372880f-95ba-4cde-a71a-01e2a06a0644', prisonNumber: person.prisonNumber }),
    courseParticipationFactory.build({ id: 'eb357e5d-5416-43bf-a8d2-0dc8fd92162e', prisonNumber: person.prisonNumber }),
  ]

  describe('all', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Courses exist on the API',
        uponReceiving: 'A request for all courses',
        willRespondWith: {
          body: Matchers.like(allCourses),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.courses.index({}),
        },
      })
    })

    it('fetches all courses', async () => {
      const result = await courseClient.all()

      expect(result).toEqual(allCourses)
    })
  })

  describe('createParticipation', () => {
    const courseParticipation = courseParticipationFactory
      .new()
      .build({ id: 'c35c5c3c-7d97-40e6-a744-9526d68495d0', prisonNumber: person.prisonNumber })
    const { courseName, prisonNumber } = courseParticipation

    beforeEach(() => {
      provider.addInteraction({
        state: `A person exists with prison number ${prisonNumber}`,
        uponReceiving: `A request to create a course participation for person "${prisonNumber}"`,
        willRespondWith: {
          body: Matchers.like(courseParticipation),
          status: 201,
        },
        withRequest: {
          body: { courseName, prisonNumber },
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'POST',
          path: apiPaths.participations.create({}),
        },
      })
    })

    it('creates a course participation', async () => {
      const result = await courseClient.createParticipation(prisonNumber, courseName)

      expect(result).toEqual(courseParticipation)
    })
  })

  describe('destroyParticipation', () => {
    const courseParticipationToDestroy = courseParticipationFactory.build({
      id: '9372880f-95ba-4cde-a71a-01e2a06a0644',
      prisonNumber: person.prisonNumber,
    })

    beforeEach(() => {
      provider.addInteraction({
        state: `A course exists with ID ${course1.id}`,
        uponReceiving: `A request to destroy course participation "${courseParticipationToDestroy.id}"`,
        willRespondWith: {
          status: 204,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'DELETE',
          path: apiPaths.participations.delete({ courseParticipationId: courseParticipationToDestroy.id }),
        },
      })
    })

    it('destroys a course participation', async () => {
      await courseClient.destroyParticipation(courseParticipationToDestroy.id)
    })
  })

  describe('find', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `A course exists with ID ${course1.id}`,
        uponReceiving: `A request for course "${course1.id}"`,
        willRespondWith: {
          body: Matchers.like(course1),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.courses.show({ courseId: course1.id }),
        },
      })
    })

    it('fetches the given course', async () => {
      const result = await courseClient.find(course1.id)

      expect(result).toEqual(course1)
    })
  })

  describe('findCourseByOffering', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `An offering with ID ${courseOffering1.id} exists and has an associated course`,
        uponReceiving: `A request for offering "${courseOffering1.id}"'s course`,
        willRespondWith: {
          body: Matchers.like(course1),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.offerings.course({ courseOfferingId: courseOffering1.id }),
        },
      })
    })

    it("fetches the given offering's course", async () => {
      const result = await courseClient.findCourseByOffering(courseOffering1.id)

      expect(result).toEqual(course1)
    })
  })

  describe('findOfferings', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `Offerings exist for a course with ID ${course1.id}`,
        uponReceiving: `A request for course "${course1.id}"'s offerings`,
        willRespondWith: {
          body: Matchers.like(allCourseOfferings),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.courses.offerings({ courseId: course1.id }),
        },
      })
    })

    it("fetches the given course's offerings", async () => {
      const result = await courseClient.findOfferings(course1.id)

      expect(result).toEqual(allCourseOfferings)
    })
  })

  describe('findCourseNames', () => {
    const courseNames = allCourses.map(course => course.name)

    beforeEach(() => {
      provider.addInteraction({
        state: 'Course names exist on the API',
        uponReceiving: 'A request for all course names',
        willRespondWith: {
          body: Matchers.like(courseNames),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
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

  describe('findOffering', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `An offering exists with ID ${courseOffering1.id}`,
        uponReceiving: `A request for course offering "${courseOffering1.id}"`,
        willRespondWith: {
          body: Matchers.like(courseOffering1),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.offerings.show({ courseOfferingId: courseOffering1.id }),
        },
      })
    })

    it('fetches the given course offering', async () => {
      const result = await courseClient.findOffering(courseOffering1.id)

      expect(result).toEqual(courseOffering1)
    })
  })

  describe('findParticipation', () => {
    const courseParticipation = courseParticipations[0]

    beforeEach(() => {
      provider.addInteraction({
        state: `A course participation exists with ID ${courseParticipation.id}`,
        uponReceiving: `A request for course participation "${courseParticipation.id}"`,
        willRespondWith: {
          body: Matchers.like(courseParticipation),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.participations.show({ courseParticipationId: courseParticipation.id }),
        },
      })
    })

    it('fetches the given course participation', async () => {
      const result = await courseClient.findParticipation(courseParticipation.id)

      expect(result).toEqual(courseParticipation)
    })
  })

  describe('findParticipationsByPerson', () => {
    const prisonNumber = 'B1234BB'
    beforeEach(() => {
      provider.addInteraction({
        state: `Participations exist for a person with prison number ${prisonNumber}`,
        uponReceiving: `A request for person "${prisonNumber}"'s participations`,
        willRespondWith: {
          body: Matchers.like(courseParticipations),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.people.participations({ prisonNumber }),
        },
      })
    })

    it("fetches the given person's course participations", async () => {
      const result = await courseClient.findParticipationsByPerson(prisonNumber)

      expect(result).toEqual(courseParticipations)
    })
  })

  describe('updateParticipation', () => {
    const courseParticipation = courseParticipationFactory.build({ id: '1c0fbebe-7768-4dbe-ae58-6036183dbeff' })
    const courseParticipationUpdate: CourseParticipationUpdate = {
      courseName: courseParticipation.courseName,
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

    beforeEach(() => {
      provider.addInteraction({
        state: `A course participation exists with ID ${courseParticipation.id}`,
        uponReceiving: `A request to update course participation "${courseParticipation.id}"`,
        willRespondWith: {
          body: Matchers.like(courseParticipation),
          status: 200,
        },
        withRequest: {
          body: courseParticipationUpdate,
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'PUT',
          path: apiPaths.participations.update({ courseParticipationId: courseParticipation.id }),
        },
      })
    })

    it('updates the given course participation', async () => {
      const result = await courseClient.updateParticipation(courseParticipation.id, courseParticipationUpdate)

      expect(result).toEqual(courseParticipation)
    })
  })
})
