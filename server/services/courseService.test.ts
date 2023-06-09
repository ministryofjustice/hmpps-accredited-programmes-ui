import { when } from 'jest-when'

import CourseService from './courseService'
import CourseClient from '../data/courseClient'
import { courseFactory, courseOfferingFactory } from '../testutils/factories'

jest.mock('../data/courseClient')

describe('CourseService', () => {
  const courseClient = new CourseClient('token') as jest.Mocked<CourseClient>
  const courseClientFactory = jest.fn()

  const service = new CourseService(courseClientFactory)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    courseClientFactory.mockReturnValue(courseClient)
  })

  describe('getCourses', () => {
    it('returns a list of all courses', async () => {
      const courses = courseFactory.buildList(3)
      courseClient.all.mockResolvedValue(courses)

      const result = await service.getCourses(token)

      expect(result).toEqual(courses)

      expect(courseClientFactory).toHaveBeenCalledWith(token)
      expect(courseClient.all).toHaveBeenCalled()
    })
  })

  describe('getCourse', () => {
    it('returns a given course', async () => {
      const course = courseFactory.build()
      when(courseClient.find).calledWith(course.id).mockResolvedValue(course)

      const result = await service.getCourse(token, course.id)

      expect(result).toEqual(course)

      expect(courseClientFactory).toHaveBeenCalledWith(token)
      expect(courseClient.find).toHaveBeenCalledWith(course.id)
    })
  })

  describe('getOfferingsByCourse', () => {
    it('returns a list of offerings for a given course', async () => {
      const course = courseFactory.build()
      const courseOfferings = courseOfferingFactory.buildList(3)
      when(courseClient.findOfferings).calledWith(course.id).mockResolvedValue(courseOfferings)

      const result = await service.getOfferingsByCourse(token, course.id)

      expect(result).toEqual(courseOfferings)

      expect(courseClientFactory).toHaveBeenCalledWith(token)
      expect(courseClient.findOfferings).toHaveBeenCalledWith(course.id)
    })
  })

  describe('getOffering', () => {
    it('returns a given offering', async () => {
      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()

      when(courseClient.findOffering).calledWith(course.id, courseOffering.id).mockResolvedValue(courseOffering)

      const result = await service.getOffering(token, course.id, courseOffering.id)

      expect(result).toEqual(courseOffering)

      expect(courseClientFactory).toHaveBeenCalledWith(token)
      expect(courseClient.findOffering).toHaveBeenCalledWith(course.id, courseOffering.id)
    })
  })
})
