import { faker } from '@faker-js/faker/locale/en_GB'

import type {
  CourseOfferingRecord,
  CoursePrerequisiteRecord,
  CourseRecord,
  ReferralRecord,
  ReferrerUserRecord,
} from '.'
import organisationIds from './organisationIds'
import {
  courseFactory,
  courseOfferingFactory,
  coursePrerequisiteFactory,
  randomStatus,
  referralFactory,
} from '../../../server/testutils/factories'
import { StringUtils } from '../../../server/utils'
import { caseloads, prisoners } from '../../../wiremock/stubs'
import type { Referral } from '@accredited-programmes/api'
import type { Organisation } from '@accredited-programmes/ui'

export default class TableRecords {
  static course(): Array<CourseRecord> {
    this.cachedCourse ||= courseFactory.buildList(10).map((courseRecord, courseRecordIndex) => ({
      ...courseRecord,
      // this might not be the most realistic implementation of identifier, but
      // really we just need it to be unique: the initialised title is a bit of
      // realism dressing on an otherwise simple unique value generator
      identifier: StringUtils.initialiseTitle(courseRecord.name) + courseRecordIndex,
    }))

    return this.cachedCourse
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

      // one offering for active case load ID should have at least 100 submitted
      // referrals to allow us to fully test features like pagination
      const firstReferableOfferingForActiveCaseLoadId = this.referableOfferingRecordsForActiveCaseLoadId()[0]
      while (records.length < 100) {
        records.push(
          this.referralRecord(
            firstReferableOfferingForActiveCaseLoadId.id,
            faker.helpers.arrayElement(prisoners).prisonerNumber,
            randomStatus(['referral_submitted', 'assessment_started', 'awaiting_assessment']),
          ),
        )
      }

      // and maybe a few draft referrals
      while (records.length < 110) {
        records.push(
          this.referralRecord(
            firstReferableOfferingForActiveCaseLoadId.id,
            faker.helpers.arrayElement(prisoners).prisonerNumber,
            'referral_started',
          ),
        )
      }

      // some other offerings for active case load ID should have referrals
      const subsequentReferableOfferingsForActiveCaseLoadId =
        this.referableOfferingRecordsForActiveCaseLoadId().slice(1)
      while (records.length < 200) {
        records.push(
          this.referralRecord(
            faker.helpers.arrayElement(subsequentReferableOfferingsForActiveCaseLoadId).id,
            faker.helpers.arrayElement(prisoners).prisonerNumber,
          ),
        )
      }

      // some other organisations should have referrals
      while (records.length < 250) {
        records.push(
          this.referralRecord(
            faker.helpers.arrayElement(this.referableOfferingRecordsForNonActiveCaseLoadOrganisations()).id,
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
      .arrayElements(this.course(), {
        max: this.course().length - 1 || 1,
        min: Math.ceil(this.course().length * 0.8),
      })
      .map(courseRecord => {
        return {
          courseId: courseRecord.id,
          ...courseOfferingFactory.build({ organisationId: this.activeCaseLoadId() }),
        }
      })

    return this.cachedOfferingsForActiveCaseLoadId
  }

  private static offeringsForNonActiveCaseLoadOrganisations(): Array<CourseOfferingRecord> {
    this.cachedOfferingsForNonActiveCaseLoadOrganisations ||= this.course()
      .map(courseRecord => {
        const organisationIdsForCourse = faker.helpers.arrayElements(this.nonActiveCaseLoadOrganisationsIds())

        return organisationIdsForCourse.map(organisationId => ({
          courseId: courseRecord.id,
          ...courseOfferingFactory.build({ organisationId }),
        }))
      })
      .flat()

    return this.cachedOfferingsForNonActiveCaseLoadOrganisations
  }

  private static referableOfferingRecordsForActiveCaseLoadId(): Array<CourseOfferingRecord> {
    this.cachedReferableOfferingRecordsForActiveCaseLoadId ||= this.offeringsForActiveCaseLoadId().filter(
      offeringRecord => offeringRecord.referable,
    )

    return this.cachedReferableOfferingRecordsForActiveCaseLoadId
  }

  private static referableOfferingRecordsForNonActiveCaseLoadOrganisations(): Array<CourseOfferingRecord> {
    this.cachedReferableOfferingRecordsForNonActiveCaseLoadOrganisations ||= this.offeringsForActiveCaseLoadId().filter(
      offeringRecord => offeringRecord.referable,
    )

    return this.cachedReferableOfferingRecordsForNonActiveCaseLoadOrganisations
  }

  private static referralRecord(
    offeringId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
    status?: Referral['status'],
  ): ReferralRecord {
    const referrer = faker.helpers.arrayElement(this.seededReferrers)
    const referral = referralFactory.build({
      offeringId,
      prisonNumber,
      referrerUsername: referrer.username,
      status: status || randomStatus(),
    })
    return {
      ...referral,
      status: referral.status.toUpperCase() as ReferralRecord['status'],
    }
  }

  static cachedActiveCaseLoadId: Organisation['id']

  static cachedCourse: Array<CourseRecord>

  static cachedNonActiveCaseLoadOrganisationsIds: Array<Organisation['id']>

  static cachedOffering: Array<CourseOfferingRecord>

  static cachedOfferingsForActiveCaseLoadId: Array<CourseOfferingRecord>

  static cachedOfferingsForNonActiveCaseLoadOrganisations: Array<CourseOfferingRecord>

  static cachedPrerequisite: Array<CoursePrerequisiteRecord>

  static cachedReferableOfferingRecordsForActiveCaseLoadId: Array<CourseOfferingRecord>

  static cachedReferableOfferingRecordsForNonActiveCaseLoadOrganisations: Array<CourseOfferingRecord>

  static cachedReferral: Array<ReferralRecord>

  static cachedReferrerUser: Array<ReferrerUserRecord>

  static seededReferrers = [
    { id: '3F2504E0-4F89-41D3-9A0C-0305E82C3301', username: 'ACP_POM_USER' },
    { id: '3F2504E0-4F89-41D3-9A0C-0305E82C3302', username: 'ACP_PT_REFERRER_USER' },
  ]
}
