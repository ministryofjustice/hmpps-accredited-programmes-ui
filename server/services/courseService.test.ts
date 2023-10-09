import { faker } from '@faker-js/faker'
import createError from 'http-errors'
import { when } from 'jest-when'

import CourseService from './courseService'
import { CourseClient } from '../data'
import { courseFactory, courseOfferingFactory, courseParticipationFactory, personFactory } from '../testutils/factories'
import type { CourseParticipationUpdate } from '@accredited-programmes/models'

jest.mock('../data/courseClient')

describe('CourseService', () => {
  const courseClient = new CourseClient('token') as jest.Mocked<CourseClient>
  const courseClientBuilder = jest.fn()

  const service = new CourseService(courseClientBuilder)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    courseClientBuilder.mockReturnValue(courseClient)
  })

  describe('createParticipation', () => {
    const person = personFactory.build()

    describe('when `courseId` is provided', () => {
      it('creates a course participation using the `courseId` value', async () => {
        const courseParticipation = courseParticipationFactory.withCourseId().build()
        const { courseId } = courseParticipation

        when(courseClient.createParticipation)
          .calledWith(person.prisonNumber, courseId, undefined)
          .mockResolvedValue(courseParticipation)

        const result = await service.createParticipation(token, person.prisonNumber, courseId)

        expect(result).toEqual(courseParticipation)

        expect(courseClientBuilder).toHaveBeenCalledWith(token)
        expect(courseClient.createParticipation).toHaveBeenCalledWith(person.prisonNumber, courseId, undefined)
      })
    })

    describe('when `otherCourseName` is provided and `courseId` is not', () => {
      it('creates a course participation using the `otherCourseName` value', async () => {
        const courseParticipation = courseParticipationFactory.withOtherCourseName().build()
        const { otherCourseName } = courseParticipation

        when(courseClient.createParticipation)
          .calledWith(person.prisonNumber, undefined, otherCourseName)
          .mockResolvedValue(courseParticipation)

        const result = await service.createParticipation(token, person.prisonNumber, undefined, otherCourseName)

        expect(result).toEqual(courseParticipation)

        expect(courseClientBuilder).toHaveBeenCalledWith(token)
        expect(courseClient.createParticipation).toHaveBeenCalledWith(person.prisonNumber, undefined, otherCourseName)
      })
    })
  })

  describe('deleteParticipation', () => {
    it('asks the client to delete a course participation', async () => {
      const courseParticipation = courseParticipationFactory.build()

      await service.deleteParticipation(token, courseParticipation.id)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.destroyParticipation).toHaveBeenCalledWith(courseParticipation.id)
    })
  })

  describe('getCourses', () => {
    it('returns a list of all courses', async () => {
      const courses = courseFactory.buildList(3)
      courseClient.all.mockResolvedValue(courses)

      const result = await service.getCourses(token)

      expect(result).toEqual(courses)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.all).toHaveBeenCalled()
    })
  })

  describe('getCourse', () => {
    it('returns a given course', async () => {
      const course = courseFactory.build()
      when(courseClient.find).calledWith(course.id).mockResolvedValue(course)

      const result = await service.getCourse(token, course.id)

      expect(result).toEqual(course)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.find).toHaveBeenCalledWith(course.id)
    })
  })

  describe('getCourseByOffering', () => {
    it('returns the course associated with a given offering', async () => {
      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()
      when(courseClient.findCourseByOffering).calledWith(courseOffering.id).mockResolvedValue(course)

      const result = await service.getCourseByOffering(token, courseOffering.id)

      expect(result).toEqual(course)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.findCourseByOffering).toHaveBeenCalledWith(courseOffering.id)
    })
  })

  describe('getOfferingsByCourse', () => {
    it('returns a list of offerings for a given course', async () => {
      const course = courseFactory.build()
      const courseOfferings = courseOfferingFactory.buildList(3)
      when(courseClient.findOfferings).calledWith(course.id).mockResolvedValue(courseOfferings)

      const result = await service.getOfferingsByCourse(token, course.id)

      expect(result).toEqual(courseOfferings)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.findOfferings).toHaveBeenCalledWith(course.id)
    })
  })

  describe('getOffering', () => {
    it('returns a given offering', async () => {
      const courseOffering = courseOfferingFactory.build()

      when(courseClient.findOffering).calledWith(courseOffering.id).mockResolvedValue(courseOffering)

      const result = await service.getOffering(token, courseOffering.id)

      expect(result).toEqual(courseOffering)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.findOffering).toHaveBeenCalledWith(courseOffering.id)
    })
  })

  describe('getParticipation', () => {
    it('returns a given course participation', async () => {
      const courseParticipation = courseParticipationFactory.build()

      when(courseClient.findParticipation).calledWith(courseParticipation.id).mockResolvedValue(courseParticipation)

      const result = await service.getParticipation(token, courseParticipation.id)

      expect(result).toEqual(courseParticipation)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.findParticipation).toHaveBeenCalledWith(courseParticipation.id)
    })

    describe('when the course client throws a 404 error', () => {
      it('throws a not found error message`', async () => {
        const clientError = createError(404)
        courseClient.findParticipation.mockRejectedValue(clientError)

        const notFoundCourseParticipationId = 'NOT-FOUND'

        await expect(() => service.getParticipation(token, notFoundCourseParticipationId)).rejects.toThrowError(
          `Course participation with ID ${notFoundCourseParticipationId} not found.`,
        )

        expect(courseClientBuilder).toHaveBeenCalledWith(token)
        expect(courseClient.findParticipation).toHaveBeenCalledWith(notFoundCourseParticipationId)
      })
    })

    describe('when the course client throws any other error', () => {
      it('throws a generic error message', async () => {
        const clientError = createError(500)
        courseClient.findParticipation.mockRejectedValue(clientError)

        const courseParticipationId = faker.string.uuid()

        await expect(() => service.getParticipation(token, courseParticipationId)).rejects.toThrowError(
          `Error fetching course participation with ID ${courseParticipationId}.`,
        )

        expect(courseClientBuilder).toHaveBeenCalledWith(token)
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

      const result = await service.getParticipationsByPerson(token, person.prisonNumber)

      expect(result).toEqual(courseParticipations)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.findParticipationsByPerson).toHaveBeenCalledWith(person.prisonNumber)
    })

    describe('when the person has no previous course participations', () => {
      it('returns an empty array', async () => {
        when(courseClient.findParticipationsByPerson).calledWith(person.prisonNumber).mockResolvedValue([])

        const result = await service.getParticipationsByPerson(token, person.prisonNumber)

        expect(result).toEqual([])

        expect(courseClientBuilder).toHaveBeenCalledWith(token)
        expect(courseClient.findParticipationsByPerson).toHaveBeenCalledWith(person.prisonNumber)
      })
    })
  })

  describe('updateParticipation', () => {
    it('asks the client to update a course participation', async () => {
      const courseId = 'course-id'
      const courseParticipation = courseParticipationFactory.withCourseId().build({ courseId })
      const courseParticipationUpdate: CourseParticipationUpdate = {
        courseId,
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

      when(courseClient.updateParticipation)
        .calledWith(courseParticipation.id, courseParticipationUpdate)
        .mockResolvedValue(courseParticipation)

      const result = await service.updateParticipation(token, courseParticipation.id, courseParticipationUpdate)

      expect(result).toEqual(courseParticipation)

      expect(courseClientBuilder).toHaveBeenCalledWith(token)
      expect(courseClient.updateParticipation).toHaveBeenCalledWith(courseParticipation.id, courseParticipationUpdate)
    })
  })
})
