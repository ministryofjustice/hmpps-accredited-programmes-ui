import presentCourse from './courseUtils'
import { courseAudienceFactory, courseFactory } from '../testutils/factories'

describe('courseUtils', () => {
  describe('presentCourse', () => {
    it('returns a course with UI-formatted audience and prerequisite data', () => {
      const course = courseFactory.build({
        audiences: [
          courseAudienceFactory.build({ value: 'Intimate partner violence' }),
          courseAudienceFactory.build({ value: 'General violence' }),
        ],
      })

      expect(presentCourse(course)).toEqual('fish')
    })
  })
})
