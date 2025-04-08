import type { Organisation } from './Organisation'
import type { Person } from './Person'
import type { TagColour } from '@accredited-programmes/ui'
import type { Course, Referral } from '@accredited-programmes-api'
import type { User } from '@manage-users-api'

const referralStatuses = [
  'assessed_suitable',
  'assessment_started',
  'awaiting_assessment',
  'deselected',
  'not_suitable',
  'on_hold_awaiting_assessment',
  'on_hold_assessment_started',
  'on_hold_referral_submitted',
  'on_programme',
  'programme_complete',
  'referral_started',
  'referral_submitted',
  'suitable_not_ready',
  'withdrawn',
] as const

const referralStatusGroups = ['open', 'draft', 'closed'] as const

interface ConfirmationFields {
  hasConfirmation: boolean
  notesOptional: boolean
  primaryDescription: string
  primaryHeading: string
  secondaryDescription: string
  secondaryHeading: string
  warningText: string
}

type ReferralStatus = (typeof referralStatuses)[number]

type ReferralStatusUppercase = Uppercase<ReferralStatus>

type ReferralStatusCategory = {
  code: string
  description: string
  referralStatusCode: ReferralStatusUppercase
}

type ReferralStatusGroup = (typeof referralStatusGroups)[number]

type ReferralStatusUpdate = {
  status: ReferralStatus | ReferralStatusUppercase
  category?: Uppercase<string>
  notes?: string
  ptUser?: boolean
  reason?: Uppercase<string>
}

type ReferralStatusRefData = {
  code: ReferralStatusUppercase
  colour: TagColour
  description: string
  closed?: boolean
  confirmationText?: string
  deselectAndKeepOpen?: boolean
  draft?: boolean
  hasConfirmation?: boolean
  hasNotes?: boolean
  hintText?: string
  hold?: boolean
  notesOptional?: boolean
  release?: boolean
}

type ReferralView = {
  id: Referral['id'] // eslint-disable-next-line @typescript-eslint/member-ordering
  audience?: string
  conditionalReleaseDate?: Person['conditionalReleaseDate']
  courseName?: Course['name']
  earliestReleaseDate?: string
  earliestReleaseDateType?: string
  forename?: string
  hasLdc: boolean
  listDisplayName?: string
  location?: string
  nonDtoReleaseDateType?: string
  organisationId?: Organisation['id']
  organisationName?: Organisation['name']
  paroleEligibilityDate?: Person['paroleEligibilityDate']
  prisonNumber?: Person['prisonNumber']
  referrerUsername?: User['username']
  sentenceType?: string
  status?: string
  statusColour?: Referral['statusColour']
  statusDescription?: Referral['statusDescription']
  submittedOn?: Referral['submittedOn']
  surname?: string
  tariffExpiryDate?: Person['tariffDate']
  tasksCompleted?: number
}

type ReferralStatusWithReasons = Extract<ReferralStatusUppercase, 'ASSESSED_SUITABLE' | 'DESELECTED' | 'WITHDRAWN'>

export { referralStatusGroups, referralStatuses }

export type {
  ConfirmationFields,
  ReferralStatus,
  ReferralStatusCategory,
  ReferralStatusGroup,
  ReferralStatusRefData,
  ReferralStatusUpdate,
  ReferralStatusUppercase,
  ReferralStatusWithReasons,
  ReferralView,
}
