import { faker } from '@faker-js/faker'
import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import CourseService from './courseService'
import type UserService from './userService'
import type { RedisClient } from '../data'
import { CourseClient, HmppsAuthClient, TokenStore } from '../data'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  personFactory,
  userFactory,
} from '../testutils/factories'
import { CourseParticipationUtils, StringUtils } from '../utils'
import type { CourseParticipationUpdate } from '@accredited-programmes/api'

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

  describe('createParticipation', () => {
    it('creates a course participation using the `courseName` value', async () => {
      const person = personFactory.build()
      const courseParticipation = courseParticipationFactory.build()
      const { courseName } = courseParticipation

      when(courseClient.createParticipation)
        .calledWith(person.prisonNumber, courseName)
        .mockResolvedValue(courseParticipation)

      const result = await service.createParticipation(username, person.prisonNumber, courseName)

      expect(result).toEqual(courseParticipation)

      expect(courseClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(courseClient.createParticipation).toHaveBeenCalledWith(person.prisonNumber, courseName)
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

  describe('getAndPresentCourseParticipationsByPrisonNumber', () => {
    const person = personFactory.build()
    const addedByUser = userFactory.build({ name: 'john smith' })

    const earliestCourseParticipation = courseParticipationFactory.build({
      addedBy: addedByUser.username,
      createdAt: '2022-01-01T12:00:00.000Z',
      prisonNumber: person.prisonNumber,
    })
    const latestCourseParticipation = courseParticipationFactory.build({
      addedBy: addedByUser.username,
      createdAt: '2023-01-01T12:00:00.000Z',
      prisonNumber: person.prisonNumber,
    })
    const addedByDisplayName = StringUtils.convertToTitleCase(addedByUser.name)

    beforeEach(() => {
      courseClient.findParticipationsByPerson.mockResolvedValue([
        latestCourseParticipation,
        earliestCourseParticipation,
      ])

      userService.getFullNameFromUsername.mockResolvedValue(addedByDisplayName)
    })

    describe('when no actions are passed', () => {
      it('fetches the creator, then formats the participation and creator in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', async () => {
        when(CourseParticipationUtils.summaryListOptions as jest.Mock)
          .calledWith({ ...earliestCourseParticipation, addedByDisplayName }, 'a-referral-id', {
            change: true,
            remove: true,
          })
          .mockReturnValue('course participation 1 options')
        when(CourseParticipationUtils.summaryListOptions as jest.Mock)
          .calledWith({ ...latestCourseParticipation, addedByDisplayName }, 'a-referral-id', {
            change: true,
            remove: true,
          })
          .mockReturnValue('course participation 2 options')

        const result = await service.getAndPresentParticipationsByPerson(
          username,
          userToken,
          person.prisonNumber,
          'a-referral-id',
        )

        expect(result).toEqual(['course participation 1 options', 'course participation 2 options'])
      })
    })

    describe('when actions are passed', () => {
      it('uses the specified actions when creating options for the summary list Nunjucks macro', async () => {
        await service.getAndPresentParticipationsByPerson(username, userToken, person.prisonNumber, 'a-referral-id', {
          change: false,
          remove: false,
        })

        expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
          1,
          { ...earliestCourseParticipation, addedByDisplayName },
          'a-referral-id',
          {
            change: false,
            remove: false,
          },
        )

        expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
          2,
          { ...latestCourseParticipation, addedByDisplayName },
          'a-referral-id',
          {
            change: false,
            remove: false,
          },
        )
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
        .calledWith({ ...courseParticipation, addedByDisplayName }, referralId, {
          change: true,
          remove: true,
        })
        .mockReturnValue('course participation 1 options')

      const result = await service.presentCourseParticipation(userToken, courseParticipation, referralId)

      expect(result).toEqual('course participation 1 options')
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
