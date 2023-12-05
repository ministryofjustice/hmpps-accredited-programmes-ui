import { faker } from '@faker-js/faker/locale/en_GB'

import type { TableDefinition } from '.'
import organisationIds from './organisationIds'
import {
  courseAudienceFactory,
  courseFactory,
  courseOfferingFactory,
  coursePrerequisiteFactory,
  referralFactory,
} from '../../../server/testutils/factories'
import { StringUtils } from '../../../server/utils'
import prisoners from '../../../wiremock/stubs/prisoners.json'

const course: TableDefinition = {
  properties: [
    { api: 'course_id', ui: 'id' },
    { api: 'name', ui: 'name' },
    { api: 'identifier', ui: 'identifier' },
    { api: 'description', ui: 'description' },
    { api: 'alternate_name', ui: 'alternateName' },
    { api: 'referable', ui: 'referable' },
  ],
  records: courseFactory.buildList(10).map((courseRecord, courseRecordIndex) => ({
    ...courseRecord,
    // this might not be the most realistic implementation of identifier, but
    // really we just need it to be unique: the initialised title is a bit of
    // realism dressing on an otherwise simple unique value generator
    identifier: StringUtils.initialiseTitle(courseRecord.name) + courseRecordIndex,
  })),
  tableName: 'course',
}

const prerequisite: TableDefinition = {
  properties: [
    { api: 'course_id', ui: 'courseId' },
    { api: 'name', ui: 'name' },
    { api: 'description', ui: 'description' },
  ],
  records: course.records
    .map(courseRecord => {
      return [
        { courseId: courseRecord.id, ...coursePrerequisiteFactory.setting().build() },
        { courseId: courseRecord.id, ...coursePrerequisiteFactory.gender().build() },
        { courseId: courseRecord.id, ...coursePrerequisiteFactory.riskCriteria().build() },
      ]
    })
    .flat(),
  tableName: 'prerequisite',
}

const audience: TableDefinition = {
  properties: [
    { api: 'audience_id', ui: 'id' },
    { api: 'audience_value', ui: 'value' },
  ],
  records: [
    'Sexual offence',
    'Extremism offence',
    'Gang offence',
    'General violence offence',
    'Intimate partner violence offence',
    'General offence',
  ].map(value => courseAudienceFactory.build({ value })),
  tableName: 'audience',
}

const courseAudience: TableDefinition = {
  properties: [
    { api: 'course_id', ui: 'courseId' },
    { api: 'audience_id', ui: 'audienceId' },
  ],
  records: course.records.map(courseRecord => ({
    audienceId: faker.helpers.arrayElement(audience.records).id,
    courseId: courseRecord.id,
  })),
  tableName: 'course_audience',
}

const offering: TableDefinition = {
  properties: [
    { api: 'offering_id', ui: 'id' },
    { api: 'course_id', ui: 'courseId' },
    { api: 'organisation_id', ui: 'organisationId' },
    { api: 'contact_email', ui: 'contactEmail' },
    { api: 'secondary_contact_email', ui: 'secondaryContactEmail' },
  ],
  records: course.records
    .map(courseRecord => {
      const organisationIdsForCourse = faker.helpers.arrayElements(organisationIds)

      return organisationIdsForCourse.map(organisationId => ({
        courseId: courseRecord.id,
        ...courseOfferingFactory.build({ organisationId }),
      }))
    })
    .flat(),
  tableName: 'offering',
}

// ACP_POM_USER or ACP_PT_REFERRER_USER
const validReferrerIds = ['3F2504E0-4F89-41D3-9A0C-0305E82C3301', '3F2504E0-4F89-41D3-9A0C-0305E82C3302']

const referral = {
  properties: [
    { api: 'referral_id', ui: 'id' },
    { api: 'offering_id', ui: 'offeringId' },
    { api: 'prison_number', ui: 'prisonNumber' },
    { api: 'referrer_id', ui: 'referrerId' },
    { api: 'additional_information', ui: 'additionalInformation' },
    { api: 'oasys_confirmed', ui: 'oasysConfirmed' },
    { api: 'has_reviewed_programme_history', ui: 'hasReviewedProgrammeHistory' },
    { api: 'status', ui: 'status' },
    { api: 'submitted_on', ui: 'submittedOn' },
  ],
  records: (() => {
    const recordsArray = []

    while (recordsArray.length < 100) {
      const referralRecord = referralFactory.build({
        offeringId: faker.helpers.arrayElement(offering.records).id,
        prisonNumber: faker.helpers.arrayElement(prisoners).prisonerNumber,
        referrerId: faker.helpers.arrayElement(validReferrerIds),
      })

      recordsArray.push({ ...referralRecord, status: referralRecord.status.toUpperCase() })
    }

    return recordsArray
  })(),
  tableName: 'referral',
}

export { audience, course, courseAudience, offering, prerequisite, referral }
