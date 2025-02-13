import { faker } from '@faker-js/faker'
import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import CourseService from './courseService'
import type UserService from './userService'
import type { RedisClient } from '../data'
import { CourseClient, HmppsAuthClient, TokenStore } from '../data'
import {
  audienceFactory,
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  coursePrerequisiteFactory,
  personFactory,
  referralFactory,
  userFactory,
} from '../testutils/factories'
import { CourseParticipationUtils, StringUtils } from '../utils'
import type { CourseCreateRequest, CourseOffering } from '@accredited-programmes/models'
import type { BuildingChoicesData } from '@accredited-programmes/ui'
import type { CourseParticipationCreate, CourseParticipationUpdate } from '@accredited-programmes-api'

jest.mock('../data/accreditedProgrammesApi/courseClient')
jest.mock('../data/hmppsAuthClient')
jest.mock('../utils/courseParticipationUtils')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>

describe('CourseService', () => {
  const userToken = 'user token'
  const systemToken = 'system token'
  const username = 'USERNAME'

  const courseClient = new CourseClient(systemToken) as jest.Mocked<CourseClient>
  const courseClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const userService = createMock<UserService>()
  const service = new CourseService(courseClientBuilder, hmppsAuthClientBuilder, userService)

  beforeEach(() => {
    jest.resetAllMocks()

    courseClientBuilder.mockReturnValue(courseClient)
    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)
  })

  describe('addCourseOffering', () => {
    it('adds a course offering using the `courseOfferingRequest` values', async () => {
      const courseId = courseFactory.build().id
      const courseOffering = courseOfferingFactory.build({})
      const courseOfferingRequest: Omit<CourseOffering, 'id' | 'organisationEnabled'> = {
        contactEmail: courseOffering.contactEmail,
        organisationId: courseOffering.organisationId,
        referable: courseOffering.referable,
        secondaryContactEmail: courseOffering.secondaryContactEmail,
        withdrawn: courseOffering.withdrawn,
      }

      when(courseClient.addCourseOffering).calledWith(courseId, courseOfferingRequest).mockResolvedValue(courseOffering)

      const result = await service.addCourseOffering(username, courseId, courseOfferingRequest)

      expect(result).toEqual(courseOffering)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.addCourseOffering).toHaveBeenCalledWith(courseId, courseOfferingRequest)
    })
  })

  describe('createCourse', () => {
    it('creates a course using the `courseCreateRequest` values', async () => {
      const description = faker.lorem.sentence()
      const course = courseFactory.build({ description })
      const courseCreateRequest: CourseCreateRequest = {
        alternateName: course.alternateName,
        audienceId: 'e4d1a44a-9c3b-4a7c-b79c-4d8a76488eb2',
        description,
        name: course.name,
        withdrawn: false,
      }

      when(courseClient.createCourse).calledWith(courseCreateRequest).mockResolvedValue(course)

      const result = await service.createCourse(username, courseCreateRequest)

      expect(result).toEqual(course)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.createCourse).toHaveBeenCalledWith(courseCreateRequest)
    })
  })

  describe('createParticipation', () => {
    it('creates a course participation using with the provided `CourseParticipationCreate` values', async () => {
      const courseName = 'COURSE-NAME'
      const person = personFactory.build()
      const referral = referralFactory.build()

      const participationCreateRequest: CourseParticipationCreate = {
        courseName,
        isDraft: true,
        prisonNumber: person.prisonNumber,
        referralId: referral.id,
      }

      const courseParticipation = courseParticipationFactory.build({
        courseName,
        prisonNumber: person.prisonNumber,
        referralId: referral.id,
      })

      when(courseClient.createParticipation)
        .calledWith(participationCreateRequest)
        .mockResolvedValue(courseParticipation)

      const result = await service.createParticipation(username, participationCreateRequest)

      expect(result).toEqual(courseParticipation)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.createParticipation).toHaveBeenCalledWith(participationCreateRequest)
    })
  })

  describe('deleteOffering', () => {
    it('asks the client to delete a course offering', async () => {
      const courseId = 'COURSE-ID'
      const courseOfferingId = 'COURSE-OFFERING-ID'

      await service.deleteOffering(username, courseId, courseOfferingId)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.destroyOffering).toHaveBeenCalledWith(courseId, courseOfferingId)
    })
  })

  describe('deleteParticipation', () => {
    it('asks the client to delete a course participation', async () => {
      const courseParticipation = courseParticipationFactory.build()

      await service.deleteParticipation(username, courseParticipation.id)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.destroyParticipation).toHaveBeenCalledWith(courseParticipation.id)
    })
  })

  describe('getCourseNames', () => {
    it('returns a list of all course names', async () => {
      const courses = courseFactory.buildList(3)
      const courseNames = courses.map(course => course.name)
      courseClient.findCourseNames.mockResolvedValue(courseNames)

      const result = await service.getCourseNames(username)

      expect(result).toEqual(courseNames)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findCourseNames).toHaveBeenCalled()
    })
  })

  describe('getBuildingChoicesVariants', () => {
    it('returns the courses associated with a given offering', async () => {
      const course = courseFactory.build()
      const formRequestBody = { isConvictedOfSexualOffence: 'true', isInAWomensPrison: 'false' }

      when(courseClient.findBuildingChoicesVariants)
        .calledWith(course.id, { isConvictedOfSexualOffence: true, isInAWomensPrison: false })
        .mockResolvedValue([course])

      const result = await service.getBuildingChoicesVariants(username, course.id, formRequestBody)

      expect(result).toEqual([course])
      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
    })

    describe('when either of the form request body values are not provided', () => {
      it('throws an error', async () => {
        const course = courseFactory.build()
        const formRequestBody = { isConvictedOfSexualOffence: 'true' } as BuildingChoicesData

        await expect(() =>
          service.getBuildingChoicesVariants(username, course.id, formRequestBody),
        ).rejects.toThrowError('Values for isConvictedOfSexualOffence and isInAWomensPrison must be provided.')

        expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      })
    })
  })

  describe('getCourses', () => {
    it('returns a list of all courses', async () => {
      const courses = courseFactory.buildList(3)
      courseClient.all.mockResolvedValue(courses)

      const result = await service.getCourses(username)

      expect(result).toEqual(courses)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.all).toHaveBeenCalled()
    })

    describe('when there are query parameters', () => {
      it('returns a list of courses filtered by the query parameters', async () => {
        const courses = courseFactory.buildList(3)
        courseClient.all.mockResolvedValue(courses)

        const result = await service.getCourses(username, { intensity: 'HIGH' })

        expect(result).toEqual(courses)

        expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(courseClient.all).toHaveBeenCalledWith({ intensity: 'HIGH' })
      })
    })
  })

  describe('getCourse', () => {
    it('returns a given course', async () => {
      const course = courseFactory.build()
      when(courseClient.find).calledWith(course.id).mockResolvedValue(course)

      const result = await service.getCourse(username, course.id)

      expect(result).toEqual(course)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.find).toHaveBeenCalledWith(course.id)
    })
  })

  describe('getCourseAudiences', () => {
    it('returns a list of all course audiences', async () => {
      const audiences = audienceFactory.buildList(3)
      when(courseClient.findCourseAudiences).mockResolvedValue(audiences)

      const result = await service.getCourseAudiences(username)

      expect(result).toEqual(audiences)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findCourseAudiences).toHaveBeenCalled()
    })
  })

  describe('getCourseByOffering', () => {
    it('returns the course associated with a given offering', async () => {
      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()
      when(courseClient.findCourseByOffering).calledWith(courseOffering.id).mockResolvedValue(course)

      const result = await service.getCourseByOffering(username, courseOffering.id)

      expect(result).toEqual(course)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findCourseByOffering).toHaveBeenCalledWith(courseOffering.id)
    })
  })

  describe('getCoursesByOrganisation', () => {
    it('returns a list of courses for a given organisation', async () => {
      const organisationId = faker.string.uuid()
      const courses = courseFactory.buildList(3)
      when(courseClient.findCoursesByOrganisation).calledWith(organisationId).mockResolvedValue(courses)

      const result = await service.getCoursesByOrganisation(username, organisationId)

      expect(result).toEqual(courses)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findCoursesByOrganisation).toHaveBeenCalledWith(organisationId)
    })
  })

  describe('getOfferingsByCourse', () => {
    it('returns a list of offerings for a given course', async () => {
      const course = courseFactory.build()
      const courseOfferings = courseOfferingFactory.buildList(3)
      when(courseClient.findOfferings).calledWith(course.id).mockResolvedValue(courseOfferings)

      const result = await service.getOfferingsByCourse(username, course.id)

      expect(result).toEqual(courseOfferings)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findOfferings).toHaveBeenCalledWith(course.id)
    })
  })

  describe('getOffering', () => {
    it('returns a given offering', async () => {
      const courseOffering = courseOfferingFactory.build()

      when(courseClient.findOffering).calledWith(courseOffering.id).mockResolvedValue(courseOffering)

      const result = await service.getOffering(username, courseOffering.id)

      expect(result).toEqual(courseOffering)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findOffering).toHaveBeenCalledWith(courseOffering.id)
    })
  })

  describe('getParticipation', () => {
    it('returns a given course participation', async () => {
      const courseParticipation = courseParticipationFactory.build()

      when(courseClient.findParticipation).calledWith(courseParticipation.id).mockResolvedValue(courseParticipation)

      const result = await service.getParticipation(username, courseParticipation.id)

      expect(result).toEqual(courseParticipation)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findParticipation).toHaveBeenCalledWith(courseParticipation.id)
    })

    describe('when the course client throws a 404 error', () => {
      it('throws a not found error message`', async () => {
        const clientError = createError(404)
        courseClient.findParticipation.mockRejectedValue(clientError)

        const notFoundCourseParticipationId = 'NOT-FOUND'

        await expect(() => service.getParticipation(username, notFoundCourseParticipationId)).rejects.toThrowError(
          `Course participation with ID ${notFoundCourseParticipationId} not found.`,
        )

        expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(courseClient.findParticipation).toHaveBeenCalledWith(notFoundCourseParticipationId)
      })
    })

    describe('when the course client throws any other error', () => {
      it('throws a generic error message', async () => {
        const clientError = createError(500)
        courseClient.findParticipation.mockRejectedValue(clientError)

        const courseParticipationId = faker.string.uuid()

        await expect(() => service.getParticipation(username, courseParticipationId)).rejects.toThrowError(
          `Error fetching course participation with ID ${courseParticipationId}.`,
        )

        expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(courseClient.findParticipation).toHaveBeenCalledWith(courseParticipationId)
      })
    })
  })

  describe('getParticipationsByPerson', () => {
    const person = personFactory.build()

    it('returns a list of participations for a given person', async () => {
      const courseParticipations = [
        courseParticipationFactory.build({ prisonNumber: person.prisonNumber }),
        courseParticipationFactory.build({ prisonNumber: person.prisonNumber }),
      ]

      when(courseClient.findParticipationsByPerson)
        .calledWith(person.prisonNumber)
        .mockResolvedValue(courseParticipations)

      const result = await service.getParticipationsByPerson(username, person.prisonNumber)

      expect(result).toEqual(courseParticipations)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findParticipationsByPerson).toHaveBeenCalledWith(person.prisonNumber)
    })

    describe('when the person has no previous course participations', () => {
      it('returns an empty array', async () => {
        when(courseClient.findParticipationsByPerson).calledWith(person.prisonNumber).mockResolvedValue([])

        const result = await service.getParticipationsByPerson(username, person.prisonNumber)

        expect(result).toEqual([])

        expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(courseClient.findParticipationsByPerson).toHaveBeenCalledWith(person.prisonNumber)
      })
    })
  })

  describe('getParticipationsByReferral', () => {
    const referral = referralFactory.build()

    it('returns a list of participationssorted by `createdAt` for a given referral', async () => {
      const courseParticipations = courseParticipationFactory.buildList(2, { referralId: referral.id })

      when(courseClient.findParticipationsByReferral).calledWith(referral.id).mockResolvedValue(courseParticipations)

      const result = await service.getParticipationsByReferral(username, referral.id)

      expect(result).toEqual(courseParticipations.slice(0).sort((a, b) => a.createdAt.localeCompare(b.createdAt)))

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.findParticipationsByReferral).toHaveBeenCalledWith(referral.id)
    })

    describe('when there is an error fetching the participations for a given referral', () => {
      it('throws an error', async () => {
        const clientError = createError(500)
        courseClient.findParticipationsByReferral.mockRejectedValue(clientError)

        await expect(() => service.getParticipationsByReferral(username, referral.id)).rejects.toThrow(
          `Error fetching course participations for referral with ID ${referral.id}.`,
        )

        expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(courseClient.findParticipationsByReferral).toHaveBeenCalledWith(referral.id)
      })
    })
  })

  describe('presentCourseParticipation', () => {
    const addedByUser = userFactory.build({ name: 'john smith' })
    const courseParticipation = courseParticipationFactory.build({ addedBy: addedByUser.username })
    const addedByDisplayName = StringUtils.convertToTitleCase(addedByUser.name)
    const referralId = 'a-referral-id'

    it('fetches the creator, then formats the participation and creator in the appropriate for passing to a GOV.UK summary list Nunjucks macro', async () => {
      when(userService.getFullNameFromUsername)
        .calledWith(userToken, courseParticipation.addedBy)
        .mockResolvedValue(addedByDisplayName)

      when(CourseParticipationUtils.summaryListOptions as jest.Mock)
        .calledWith({ ...courseParticipation, addedByDisplayName }, referralId, 3, {
          change: true,
          remove: true,
        })
        .mockReturnValue('course participation 1 options')

      const result = await service.presentCourseParticipation(userToken, courseParticipation, referralId, 3)

      expect(result).toEqual('course participation 1 options')
    })
  })

  describe('updateCourse', () => {
    it('asks the client to update a course', async () => {
      const course = courseFactory.build()
      const courseUpdate: CourseCreateRequest = {
        alternateName: 'Updated alternate name',
        audienceId: 'e4d1a44a-9c3b-4a7c-b79c-4d8a76488eb2',
        description: 'Updated description',
        name: 'Updated name',
        withdrawn: false,
      }

      when(courseClient.updateCourse).calledWith(course.id, courseUpdate).mockResolvedValue(course)

      const result = await service.updateCourse(username, course.id, courseUpdate)

      expect(result).toEqual(course)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.updateCourse).toHaveBeenCalledWith(course.id, courseUpdate)
    })
  })

  describe('updateCourseOffering', () => {
    it('updates a course offering using the `courseOfferingRequest` values', async () => {
      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()
      const courseOfferingRequest: Omit<CourseOffering, 'organisationEnabled'> = {
        contactEmail: 'contact-email-1@test.com',
        id: courseOffering.id,
        organisationId: 'MDI',
        referable: true,
        secondaryContactEmail: 'contact-email-2@test.com',
        withdrawn: false,
      }

      when(courseClient.updateCourseOffering)
        .calledWith(course.id, courseOfferingRequest)
        .mockResolvedValue(courseOffering)

      const result = await service.updateCourseOffering(username, course.id, courseOfferingRequest)

      expect(result).toEqual(courseOffering)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.updateCourseOffering).toHaveBeenCalledWith(course.id, courseOfferingRequest)
    })
  })

  describe('updateCoursePrerequisites', () => {
    it('asks the client to update course prerequisites', async () => {
      const courseId = 'COURSE_ID'
      const prerequisites = coursePrerequisiteFactory.buildList(3)

      when(courseClient.updateCoursePrerequisites).calledWith(courseId, prerequisites).mockResolvedValue(prerequisites)

      const result = await service.updateCoursePrerequisites(username, courseId, prerequisites)

      expect(result).toEqual(prerequisites)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.updateCoursePrerequisites).toHaveBeenCalledWith(courseId, prerequisites)
    })
  })

  describe('updateParticipation', () => {
    it('asks the client to update a course participation', async () => {
      const courseParticipation = courseParticipationFactory.build()
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
      const updatedCourseParticipation = { ...courseParticipation, ...courseParticipationUpdate }

      when(courseClient.updateParticipation)
        .calledWith(courseParticipation.id, courseParticipationUpdate)
        .mockResolvedValue(updatedCourseParticipation)

      const result = await service.updateParticipation(username, courseParticipation.id, courseParticipationUpdate)

      expect(result).toEqual(updatedCourseParticipation)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.updateParticipation).toHaveBeenCalledWith(courseParticipation.id, courseParticipationUpdate)
    })
  })
})
