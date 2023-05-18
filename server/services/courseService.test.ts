import CourseService from './courseService'
import CourseClient from '../data/courseClient'
import { courseFactory } from '../testutils/factories'

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
})
