import { faker } from '@faker-js/faker/locale/en_GB'

import type {
  CourseAudienceRecord,
  CourseOfferingRecord,
  CoursePrerequisiteRecord,
  CourseRecord,
  ReferralRecord,
  ReferrerUserRecord,
} from '.'
import organisationIds from './organisationIds'
import {
  courseAudienceFactory,
  courseFactory,
  courseOfferingFactory,
  coursePrerequisiteFactory,
  referralFactory,
} from '../../../server/testutils/factories'
import { StringUtils } from '../../../server/utils'
import { caseloads, prisoners } from '../../../wiremock/stubs'
import type { CourseAudience, Organisation, Referral } from '@accredited-programmes/models'

export default class TableRecords {
  static audience(): Array<CourseAudience> {
    this.cachedAudience ||= [
      'Sexual offence',
      'Extremism offence',
      'Gang offence',
      'General violence offence',
      'Intimate partner violence offence',
      'General offence',
    ].map(value => courseAudienceFactory.build({ value }))

    return this.cachedAudience
  }

  static course(): Array<CourseRecord> {
    this.cachedCourse ||= courseFactory
      .buildList(this.referableCourseCount + this.nonReferableCourseCount)
      .map((courseRecord, courseRecordIndex) => ({
        ...courseRecord,
        // this might not be the most realistic implementation of identifier, but
        // really we just need it to be unique: the initialised title is a bit of
        // realism dressing on an otherwise simple unique value generator
        identifier: StringUtils.initialiseTitle(courseRecord.name) + courseRecordIndex,
        // we want most of the courses to be referable, but a couple of
        // non-referable ones would be nice for realism
        referable: courseRecordIndex < this.referableCourseCount,
      }))

    return this.cachedCourse
  }

  static courseAudience(): Array<CourseAudienceRecord> {
    this.cachedCourseAudience ||= this.course().map(courseRecord => ({
      audienceId: faker.helpers.arrayElement(this.audience()).id,
      courseId: courseRecord.id,
    }))

    return this.cachedCourseAudience
  }

  static offering(): Array<CourseOfferingRecord> {
    this.cachedOffering ||= [
      ...this.offeringsForActiveCaseLoadId(),
      ...this.offeringsForNonActiveCaseLoadOrganisations(),
    ]

    return this.cachedOffering
  }

  static prerequisite(): Array<CoursePrerequisiteRecord> {
    this.cachedPrerequisite ||= this.course()
      .map(courseRecord => {
        return [
          { courseId: courseRecord.id, ...coursePrerequisiteFactory.setting().build() },
          { courseId: courseRecord.id, ...coursePrerequisiteFactory.gender().build() },
          { courseId: courseRecord.id, ...coursePrerequisiteFactory.riskCriteria().build() },
        ]
      })
      .flat()

    return this.cachedPrerequisite
  }

  static referral(): Array<ReferralRecord> {
    this.cachedReferral ||= (() => {
      const records: Array<ReferralRecord> = []

      // one offering for active case load ID should have at least 100 referrals
      // to allow us to fully test features like pagination
      const firstOfferingForActiveCaseLoadId = this.offeringsForActiveCaseLoadId()[0]
      while (records.length < 100) {
        records.push(
          this.referralRecord(
            firstOfferingForActiveCaseLoadId.id,
            faker.helpers.arrayElement(prisoners).prisonerNumber,
          ),
        )
      }

      // some other offerings for active case load ID should have referrals
      const nonFirstOfferingsForActiveCaseLoadId = this.offeringsForActiveCaseLoadId().slice(1)
      while (records.length < 200) {
        records.push(
          this.referralRecord(
            faker.helpers.arrayElement(nonFirstOfferingsForActiveCaseLoadId).id,
            faker.helpers.arrayElement(prisoners).prisonerNumber,
          ),
        )
      }

      // some other organisations should have referrals
      while (records.length < 250) {
        records.push(
          this.referralRecord(
            faker.helpers.arrayElement(this.offeringsForNonActiveCaseLoadOrganisations()).id,
            faker.helpers.arrayElement(prisoners).prisonerNumber,
          ),
        )
      }

      return records
    })()

    return this.cachedReferral
  }

  static referrerUser(): Array<ReferrerUserRecord> {
    this.cachedReferrerUser ||= this.seededReferrers.map(seededReferrer => ({
      referrerUsername: seededReferrer.username,
    }))

    return this.cachedReferrerUser
  }

  private static activeCaseLoadId(): Organisation['id'] {
    this.cachedActiveCaseLoadId ||= caseloads.find(caseload => caseload.currentlyActive)
      ?.caseLoadId as Organisation['id']

    return this.cachedActiveCaseLoadId
  }

  private static nonActiveCaseLoadOrganisationsIds(): Array<Organisation['id']> {
    this.cachedNonActiveCaseLoadOrganisationsIds ||= organisationIds.filter(
      organisationId => organisationId !== this.activeCaseLoadId(),
    )
    return this.cachedNonActiveCaseLoadOrganisationsIds
  }

  private static offeringsForActiveCaseLoadId(): Array<CourseOfferingRecord> {
    this.cachedOfferingsForActiveCaseLoadId ||= faker.helpers
      .arrayElements(this.referableCourseRecords(), {
        max: this.referableCourseRecords().length - 1 || 1,
        min: Math.ceil(this.referableCourseRecords().length * 0.8),
      })
      .map(referableCourse => {
        return {
          courseId: referableCourse.id,
          ...courseOfferingFactory.build({ organisationId: this.activeCaseLoadId() }),
        }
      })

    return this.cachedOfferingsForActiveCaseLoadId
  }

  private static offeringsForNonActiveCaseLoadOrganisations(): Array<CourseOfferingRecord> {
    this.cachedOfferingsForNonActiveCaseLoadOrganisations ||= this.referableCourseRecords()
      .map(referableCourseRecord => {
        const organisationIdsForCourse = faker.helpers.arrayElements(this.nonActiveCaseLoadOrganisationsIds())

        return organisationIdsForCourse.map(organisationId => ({
          courseId: referableCourseRecord.id,
          ...courseOfferingFactory.build({ organisationId }),
        }))
      })
      .flat()

    return this.cachedOfferingsForNonActiveCaseLoadOrganisations
  }

  private static referableCourseRecords(): Array<CourseRecord> {
    this.cachedReferableCourseRecords ||= this.course().filter(courseRecord => courseRecord.referable)

    return this.cachedReferableCourseRecords
  }

  private static referralRecord(
    offeringId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
  ): ReferralRecord {
    const referrer = faker.helpers.arrayElement(this.seededReferrers)
    const referral = referralFactory.build({
      offeringId,
      prisonNumber,
      referrerId: referrer.id,
    })
    return {
      ...referral,
      referrerUsername: referrer.username,
      status: referral.status.toUpperCase() as ReferralRecord['status'],
    }
  }

  static cachedActiveCaseLoadId: Organisation['id']

  static cachedAudience: Array<CourseAudience>

  static cachedCourse: Array<CourseRecord>

  static cachedCourseAudience: Array<CourseAudienceRecord>

  static cachedNonActiveCaseLoadOrganisationsIds: Array<Organisation['id']>

  static cachedOffering: Array<CourseOfferingRecord>

  static cachedOfferingsForActiveCaseLoadId: Array<CourseOfferingRecord>

  static cachedOfferingsForNonActiveCaseLoadOrganisations: Array<CourseOfferingRecord>

  static cachedPrerequisite: Array<CoursePrerequisiteRecord>

  static cachedReferableCourseRecords: Array<CourseRecord>

  static cachedReferral: Array<ReferralRecord>

  static cachedReferrerUser: Array<ReferrerUserRecord>

  static nonReferableCourseCount = 2

  static referableCourseCount = 8

  static seededReferrers = [
    { id: '3F2504E0-4F89-41D3-9A0C-0305E82C3301', username: 'ACP_POM_USER' },
    { id: '3F2504E0-4F89-41D3-9A0C-0305E82C3302', username: 'ACP_PT_REFERRER_USER' },
  ]
}
