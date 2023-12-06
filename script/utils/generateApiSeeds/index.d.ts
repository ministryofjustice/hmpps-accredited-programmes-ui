import type {
  Course,
  CourseAudience,
  CourseOffering,
  CoursePrerequisite,
  Referral,
} from '@accredited-programmes/models'

type Property = { api: string; ui: string }
type TableDefinition = {
  properties: Array<Property>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: Array<Record<string, any>>
  tableName: string
}

type CourseAudienceRecord = { audienceId: CourseAudience['id']; courseId: Course['id'] }
type CourseOfferingRecord = CourseOffering & { courseId: Course['id'] }
type CoursePrerequisiteRecord = CoursePrerequisite & { courseId: Course['id'] }
type CourseRecord = Course & { identifier: string }
type ReferralRecord = Omit<Referral, 'status'> & {
  referrerUsername: Express.User['username']
  status: 'ASSESSMENT_STARTED' | 'AWAITING_ASSESSMENT' | 'REFERRAL_STARTED' | 'REFERRAL_SUBMITTED'
}
type ReferrerUserRecord = { referrerUsername: Express.User['username'] }

export type {
  CourseAudienceRecord,
  CourseOfferingRecord,
  CoursePrerequisiteRecord,
  CourseRecord,
  Property,
  ReferralRecord,
  ReferrerUserRecord,
  TableDefinition,
}
