export type Person = {
  bookingId: string
  currentPrison: string
  dateOfBirth: string
  ethnicity: string
  gender: string
  name: string
  prisonNumber: string
  religionOrBelief: string
  setting: 'Custody'
  conditionalReleaseDate?: string
  earliestReleaseDate?: string
  homeDetentionCurfewEligibilityDate?: string
  paroleEligibilityDate?: string
  sentenceExpiryDate?: string
  sentenceStartDate?: string
  tariffDate?: string
}
