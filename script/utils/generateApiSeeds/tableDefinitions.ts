import type { TableDefinition } from '.'
import TableRecords from './tableRecords'

export default class TableDefinitions {
  static audience(): TableDefinition {
    return {
      properties: [
        { api: 'audience_id', ui: 'id' },
        { api: 'audience_value', ui: 'value' },
      ],
      records: TableRecords.audience(),
      tableName: 'audience',
    }
  }

  static course(): TableDefinition {
    return {
      properties: [
        { api: 'course_id', ui: 'id' },
        { api: 'name', ui: 'name' },
        { api: 'identifier', ui: 'identifier' },
        { api: 'description', ui: 'description' },
        { api: 'alternate_name', ui: 'alternateName' },
        { api: 'referable', ui: 'referable' },
      ],
      records: TableRecords.course(),
      tableName: 'course',
    }
  }

  static courseAudience(): TableDefinition {
    return {
      properties: [
        { api: 'course_id', ui: 'courseId' },
        { api: 'audience_id', ui: 'audienceId' },
      ],
      records: TableRecords.courseAudience(),
      tableName: 'course_audience',
    }
  }

  static offering(): TableDefinition {
    return {
      properties: [
        { api: 'offering_id', ui: 'id' },
        { api: 'course_id', ui: 'courseId' },
        { api: 'organisation_id', ui: 'organisationId' },
        { api: 'contact_email', ui: 'contactEmail' },
        { api: 'secondary_contact_email', ui: 'secondaryContactEmail' },
      ],
      records: TableRecords.offering(),
      tableName: 'offering',
    }
  }

  static prerequisite(): TableDefinition {
    return {
      properties: [
        { api: 'course_id', ui: 'courseId' },
        { api: 'name', ui: 'name' },
        { api: 'description', ui: 'description' },
      ],
      records: TableRecords.prerequisite(),
      tableName: 'prerequisite',
    }
  }

  static referral(): TableDefinition {
    return {
      properties: [
        { api: 'referral_id', ui: 'id' },
        { api: 'offering_id', ui: 'offeringId' },
        { api: 'prison_number', ui: 'prisonNumber' },
        { api: 'referrer_username', ui: 'referrerUsername' },
        { api: 'additional_information', ui: 'additionalInformation' },
        { api: 'oasys_confirmed', ui: 'oasysConfirmed' },
        { api: 'has_reviewed_programme_history', ui: 'hasReviewedProgrammeHistory' },
        { api: 'status', ui: 'status' },
        { api: 'submitted_on', ui: 'submittedOn' },
      ],
      records: TableRecords.referral(),
      tableName: 'referral',
    }
  }

  static referrerUser(): TableDefinition {
    return {
      properties: [{ api: 'referrer_username', ui: 'referrerUsername' }],
      records: TableRecords.referrerUser(),
      tableName: 'referrer_user',
    }
  }
}
