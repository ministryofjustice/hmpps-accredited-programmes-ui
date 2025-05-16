import { type InterfaceToTemplate, Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import CourseClient from './courseClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import {
  audienceFactory,
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  courseParticipationOutcomeFactory,
  courseParticipationSettingFactory,
} from '../../testutils/factories'
import type { CourseOffering } from '@accredited-programmes/models'
import type {
  Audience,
  CourseCreateRequest,
  CourseParticipation,
  CourseParticipationCreate,
  CourseParticipationUpdate,
  CoursePrerequisite,
} from '@accredited-programmes-api'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let courseClient: CourseClient

  const systemToken = 'token-1'
  const referralId = '0c46ed09-170b-4c0f-aee8-a24eeaeeddab'

  beforeEach(() => {
    courseClient = new CourseClient(systemToken)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  describe.skip('addCourseOffering', () => {
    const course = courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' })

    const courseOffering = courseOfferingFactory.build({
      id: '790a2dfe-7de5-4504-bb9c-83e6e53a6537',
      organisationId: 'MDI',
    })
    const courseOfferingRequestBody: Omit<CourseOffering, 'id' | 'organisationEnabled'> = {
      contactEmail: courseOffering.contactEmail,
      organisationId: courseOffering.organisationId,
      referable: courseOffering.referable,
      secondaryContactEmail: courseOffering.secondaryContactEmail,
      withdrawn: courseOffering.withdrawn,
    }

    beforeEach(() => {
      provider.addInteraction({
        state: 'A course offering can be added to a course',
        uponReceiving: 'A request to add an offering to course d3abc217-75ee-46e9-a010-368f30282367',
        willRespondWith: {
          body: Matchers.like(courseOffering),
          status: 200,
        },
        withRequest: {
          body: courseOfferingRequestBody,
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'PUT',
          path: apiPaths.offerings.create({ courseId: course.id }),
        },
      })
    })

    it('adds an offering to the given course', async () => {
      const result = await courseClient.addCourseOffering(
        'd3abc217-75ee-46e9-a010-368f30282367',
        courseOfferingRequestBody,
      )

      expect(result).toEqual(courseOffering)
    })
  })

  describe('all', () => {
    const courses = [
      {
        ...courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' }),
        courseOfferings: [],
        coursePrerequisites: [],
      },
      {
        ...courseFactory.build({ id: '28e47d30-30bf-4dab-a8eb-9fda3f6400e8' }),
        courseOfferings: [],
        coursePrerequisites: [],
      },
      {
        ...courseFactory.build({ id: '1811faa6-d568-4fc4-83ce-41118b90242e' }),
        courseOfferings: [],
        coursePrerequisites: [],
      },
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

  describe('createCourse', () => {
    const name = 'Things'
    const alternateName = 'Things Course'
    const description = 'A course about things'
    const intensity = 'HIGH'
    const course = {
      ...courseFactory.build({ alternateName, description, intensity, name }),
      courseOfferings: [],
      coursePrerequisites: [],
    }
    const courseCreateRequest: CourseCreateRequest = {
      alternateName,
      audienceId: 'e4d1a44a-9c3b-4a7c-b79c-4d8a76488eb2',
      description,
      displayOnProgrammeDirectory: true,
      intensity,
      name,
      withdrawn: false,
    }

    beforeEach(() => {
      provider.addInteraction({
        state: 'A course can be created',
        uponReceiving: 'A request to create a course',
        willRespondWith: {
          body: Matchers.like(course),
          status: 201,
        },
        withRequest: {
          body: { ...courseCreateRequest },
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'POST',
          path: apiPaths.courses.create({}),
        },
      })
    })

    it('creates a course', async () => {
      const result = await courseClient.createCourse(courseCreateRequest)

      expect(result).toEqual(course)
    })
  })

  describe('createParticipation', () => {
    const courseParticipation = courseParticipationFactory.new().build({ referralId })
    const courseParticipationRequest = {
      courseName: courseParticipation.courseName,
      isDraft: true,
      prisonNumber: courseParticipation.prisonNumber,
      referralId: courseParticipation.referralId,
    }

    const courseParticipationBody: InterfaceToTemplate<CourseParticipation> = {
      ...courseParticipation,
      outcome: null,
      setting: null,
    }
    const courseParticipationRequestBody: InterfaceToTemplate<CourseParticipationCreate> = {
      ...courseParticipationRequest,
    }

    beforeEach(() => {
      provider.addInteraction({
        state: 'A participation can be created',
        uponReceiving: 'A request to create a participation',
        willRespondWith: {
          body: Matchers.like(courseParticipationBody),
          status: 201,
        },
        withRequest: {
          body: courseParticipationRequestBody,
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'POST',
          path: apiPaths.participations.create({}),
        },
      })
    })

    it('creates a participation for the given person', async () => {
      const result = await courseClient.createParticipation(courseParticipationRequest)

      expect(result).toEqual(courseParticipationBody)
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
    const course = {
      ...courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' }),
      courseOfferings: [],
      coursePrerequisites: [],
    }

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

  describe('findCourseAudiences', () => {
    const audiences: Array<InterfaceToTemplate<Audience>> = [
      audienceFactory.build({ id: 'e4d1a44a-9c3b-4a7c-b79c-4d8a76488eb2' }),
      audienceFactory.build({ id: 'e9f9a8d8-2f7d-4a88-8f39-5d3b9071e75b' }),
      audienceFactory.build({ id: '7e2db7fc-18c5-4bda-bb0d-ec39bfa20414' }),
    ]

    beforeEach(() => {
      provider.addInteraction({
        state:
          'Audiences e4d1a44a-9c3b-4a7c-b79c-4d8a76488eb2, e9f9a8d8-2f7d-4a88-8f39-5d3b9071e75b, and 7e2db7fc-18c5-4bda-bb0d-ec39bfa20414 and no others exist',
        uponReceiving: 'A request for all audiences',
        willRespondWith: {
          body: Matchers.like(audiences),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.courses.audiences({}),
        },
      })
    })

    it('fetches all audiences', async () => {
      const result = await courseClient.findCourseAudiences()

      expect(result).toEqual(audiences)
    })
  })

  describe('findCourseByOffering', () => {
    const course = {
      ...courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' }),
      courseOfferings: [],
      coursePrerequisites: [],
    }

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

  describe('findCoursesByOrganisation', () => {
    const courses = [
      {
        ...courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' }),
        courseOfferings: [],
        coursePrerequisites: [],
      },
      {
        ...courseFactory.build({ id: '28e47d30-30bf-4dab-a8eb-9fda3f6400e8' }),
        courseOfferings: [],
        coursePrerequisites: [],
      },
      {
        ...courseFactory.build({ id: '1811faa6-d568-4fc4-83ce-41118b90242e' }),
        courseOfferings: [],
        coursePrerequisites: [],
      },
    ]

    beforeEach(() => {
      provider.addInteraction({
        state:
          'Organisation BWN has courses d3abc217-75ee-46e9-a010-368f30282367, 28e47d30-30bf-4dab-a8eb-9fda3f6400e8, and 1811faa6-d568-4fc4-83ce-41118b90242e and no others',
        uponReceiving: "A request for organisation BWN's courses",
        willRespondWith: {
          body: Matchers.like(courses),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'GET',
          path: apiPaths.organisations.courses({ organisationId: 'BWN' }),
        },
      })
    })

    it("fetches the given organisation's courses", async () => {
      const result = await courseClient.findCoursesByOrganisation('BWN')

      expect(result).toEqual(courses)
    })
  })

  describe('findOfferings', () => {
    const courseOfferings = [
      courseOfferingFactory.build({
        id: '790a2dfe-7de5-4504-bb9c-83e6e53a6537',
        secondaryContactEmail: 'nobody2-bwn@digital.justice.gov.uk',
        withdrawn: false,
      }),
      courseOfferingFactory.build({
        id: '7fffcc6a-11f8-4713-be35-cf5ff1aee517',
        secondaryContactEmail: 'nobody2-mdi@digital.justice.gov.uk',
        withdrawn: false,
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
          query: {
            includeWithdrawn: 'false',
          },
        },
      })
    })

    it("fetches the given course's offerings", async () => {
      const result = await courseClient.findOfferings('d3abc217-75ee-46e9-a010-368f30282367', {
        includeWithdrawn: false,
      })

      expect(result).toEqual(courseOfferings)
    })
  })

  describe('findOffering', () => {
    const courseOffering = courseOfferingFactory.build({
      id: '790a2dfe-7de5-4504-bb9c-83e6e53a6537',
      secondaryContactEmail: 'nobody2-bwn@digital.justice.gov.uk',
    })

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
    const courseParticipation = courseParticipationFactory.withAllOptionalFields().build({
      id: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004',
      outcome: courseParticipationOutcomeFactory.incomplete(true).build(),
      referralId,
      setting: courseParticipationSettingFactory.build(),
    })

    const courseParticipationBody: InterfaceToTemplate<CourseParticipation> = {
      ...courseParticipation,
      outcome: { ...courseParticipation.outcome },
      setting: { ...courseParticipation.setting },
    }

    beforeEach(() => {
      provider.addInteraction({
        state: 'Participation 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004 exists',
        uponReceiving: 'A request for participation 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004',
        willRespondWith: {
          body: Matchers.like(courseParticipationBody),
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
      courseParticipationFactory.withAllOptionalFields().build({
        id: '0cff5da9-1e90-4ee2-a5cb-94dc49c4b004',
        outcome: courseParticipationOutcomeFactory.incomplete(true).build(),
        prisonNumber: 'A1234AA',
        referralId,
      }),
      courseParticipationFactory.withAllOptionalFields().build({
        id: 'eb357e5d-5416-43bf-a8d2-0dc8fd92162e',
        outcome: courseParticipationOutcomeFactory.incomplete(true).build(),
        prisonNumber: 'A1234AA',
        referralId,
      }),
    ]

    const courseParticipationBody: InterfaceToTemplate<Array<CourseParticipation>> = courseParticipations.map(
      courseParticipation => ({
        ...courseParticipation,
        outcome: { ...courseParticipation.outcome },
        setting: { ...courseParticipation.setting },
      }),
    )

    beforeEach(() => {
      provider.addInteraction({
        state:
          'Person A1234AA has participations 0cff5da9-1e90-4ee2-a5cb-94dc49c4b004 and eb357e5d-5416-43bf-a8d2-0dc8fd92162e and no others',
        uponReceiving: "A request for person A1234AA's participations",
        willRespondWith: {
          body: Matchers.like(courseParticipationBody),
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

  describe.skip('updateCoursePrerequisites', () => {
    const course = courseFactory.build({ id: 'd3abc217-75ee-46e9-a010-368f30282367' })
    const prerequisites: Array<InterfaceToTemplate<CoursePrerequisite>> = [
      {
        description: 'Male',
        name: 'Gender',
      },
    ]

    beforeEach(() => {
      provider.addInteraction({
        state: 'Course prerequisites for d3abc217-75ee-46e9-a010-368f30282367 can be updated',
        uponReceiving: 'A request to update course prerequisites for d3abc217-75ee-46e9-a010-368f30282367',
        willRespondWith: {
          body: Matchers.like(prerequisites),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${systemToken}`,
          },
          method: 'PUT',
          path: apiPaths.courses.prerequisites({ courseId: course.id }),
        },
      })
    })

    it('updates the course with the given course prerequisites', async () => {
      const result = await courseClient.updateCoursePrerequisites(course.id, prerequisites as Array<CoursePrerequisite>)

      expect(result).toEqual(prerequisites)
    })
  })

  describe('updateParticipation', () => {
    const courseParticipation = courseParticipationFactory.build({
      id: 'cc8eb19e-050a-4aa9-92e0-c654e5cfe281',
      outcome: courseParticipationOutcomeFactory.incomplete().build(),
      referralId,
    })

    const courseParticipationUpdate = {
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
    const updatedCourseParticipation: InterfaceToTemplate<CourseParticipation> = {
      ...courseParticipation,
      ...courseParticipationUpdate,
      outcome: courseParticipationUpdate.outcome,
      setting: courseParticipationUpdate.setting,
    }

    beforeEach(() => {
      provider.addInteraction({
        state: 'Participation cc8eb19e-050a-4aa9-92e0-c654e5cfe281 exists',
        uponReceiving: 'A request to update participation cc8eb19e-050a-4aa9-92e0-c654e5cfe281',
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
          path: apiPaths.participations.update({ courseParticipationId: 'cc8eb19e-050a-4aa9-92e0-c654e5cfe281' }),
        },
      })
    })

    it('updates the given participation', async () => {
      const result = await courseClient.updateParticipation(
        'cc8eb19e-050a-4aa9-92e0-c654e5cfe281',
        courseParticipationUpdate as CourseParticipationUpdate,
      )

      expect(result).toEqual(updatedCourseParticipation)
    })
  })
})
