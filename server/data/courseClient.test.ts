import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import CourseClient from './courseClient'
import config from '../config'
import { apiPaths } from '../paths'
import { courseFactory, courseOfferingFactory, courseParticipationFactory, personFactory } from '../testutils/factories'
import type { CourseParticipation } from '@accredited-programmes/models'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let courseClient: CourseClient

  const token = 'token-1'

  beforeEach(() => {
    courseClient = new CourseClient(token)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  const course1 = courseFactory.build({
    id: '28e47d30-30bf-4dab-a8eb-9fda3f6400e8', // eslint-disable-next-line sort-keys
    alternateName: 'AC++',
  })
  const course2 = courseFactory.build({
    id: 'd3abc217-75ee-46e9-a010-368f30282367', // eslint-disable-next-line sort-keys
    alternateName: 'LC',
  })
  const course3 = courseFactory.build({
    id: '1811faa6-d568-4fc4-83ce-41118b90242e', // eslint-disable-next-line sort-keys
    alternateName: null,
  })
  const allCourses = [course1, course2, course3]
  const courseOfferings = courseOfferingFactory.buildList(3)
  const courseOffering = courseOfferingFactory.build({
    id: '20f3abc8-dd92-43ae-b88e-5797a0ad3f4b', // eslint-disable-next-line sort-keys
    secondaryContactEmail: 'nobody2-iry@digital.justice.gov.uk',
  })
  const person = personFactory.build()
  const courseParticipations = [
    courseParticipationFactory.build({ prisonNumber: person.prisonNumber }),
    courseParticipationFactory.build({ prisonNumber: person.prisonNumber }),
    courseParticipationFactory.build({ prisonNumber: person.prisonNumber }),
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
    describe('when `courseId` is provided', () => {
      const courseParticipation = courseParticipationFactory.withCourseId().build()
      const { courseId, prisonNumber } = courseParticipation

      beforeEach(() => {
        provider.addInteraction({
          state: `A person exists with prison number ${prisonNumber}`,
          uponReceiving: `A request to create a course participation for person "${prisonNumber}"`,
          willRespondWith: {
            body: Matchers.like(courseParticipation),
            status: 201,
          },
          withRequest: {
            body: { courseId, prisonNumber } as CourseParticipation & { courseId: string },
            headers: {
              authorization: `Bearer ${token}`,
            },
            method: 'POST',
            path: apiPaths.participations.create({}),
          },
        })
      })

      it('creates a course participation using the `courseId` value', async () => {
        const result = await courseClient.createParticipation(prisonNumber, courseId)

        expect(result).toEqual(courseParticipation)
      })
    })

    describe('when `otherCourseName` is provided and `courseId` is not', () => {
      const courseParticipation = courseParticipationFactory.withOtherCourseName().build()
      const { otherCourseName, prisonNumber } = courseParticipation

      beforeEach(() => {
        provider.addInteraction({
          state: `A person exists with prison number ${prisonNumber}`,
          uponReceiving: `A request to create a course participation for person "${prisonNumber}"`,
          willRespondWith: {
            body: Matchers.like(courseParticipation),
            status: 201,
          },
          withRequest: {
            body: { otherCourseName, prisonNumber } as CourseParticipation & { otherCourseName: string },
            headers: {
              authorization: `Bearer ${token}`,
            },
            method: 'POST',
            path: apiPaths.participations.create({}),
          },
        })
      })

      it('creates a course participation using the `otherCourseName` value', async () => {
        const result = await courseClient.createParticipation(prisonNumber, undefined, otherCourseName)

        expect(result).toEqual(courseParticipation)
      })
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
        state: `An offering with ID ${courseOffering.id} exists and has an associated course`,
        uponReceiving: `A request for offering "${courseOffering.id}"'s course`,
        willRespondWith: {
          body: Matchers.like(course1),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.offerings.course({ courseOfferingId: courseOffering.id }),
        },
      })
    })

    it("fetches the given offering's course", async () => {
      const result = await courseClient.findCourseByOffering(courseOffering.id)

      expect(result).toEqual(course1)
    })
  })

  describe('findOfferings', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `Offerings exist for a course with ID ${course1.id}`,
        uponReceiving: `A request for course "${course1.id}"'s offerings`,
        willRespondWith: {
          body: Matchers.like(courseOfferings),
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

      expect(result).toEqual(courseOfferings)
    })
  })

  describe('findOffering', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `An offering exists with ID ${courseOffering.id}`,
        uponReceiving: `A request for course offering "${courseOffering.id}"`,
        willRespondWith: {
          body: Matchers.like(courseOffering),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.offerings.show({ courseOfferingId: courseOffering.id }),
        },
      })
    })

    it('fetches the given course offering', async () => {
      const result = await courseClient.findOffering(courseOffering.id)

      expect(result).toEqual(courseOffering)
    })
  })

  describe('findParticipationsByPerson', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `Participations exist for a person with prison number ${person.prisonNumber}`,
        uponReceiving: `A request for person "${person.prisonNumber}"'s participations`,
        willRespondWith: {
          body: Matchers.like(courseParticipations),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.people.participations({ prisonNumber: person.prisonNumber }),
        },
      })
    })

    it("fetches the given person's course participations", async () => {
      const result = await courseClient.findParticipationsByPerson(person.prisonNumber)

      expect(result).toEqual(courseParticipations)
    })
  })
})
