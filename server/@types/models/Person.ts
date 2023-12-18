export type Person = {
  dateOfBirth: string
  ethnicity: string
  gender: string
  name: string
  prisonNumber: string
  religionOrBelief: string
  setting: 'Custody'
  bookingId?: string
  conditionalReleaseDate?: string
  currentPrison?: string
  homeDetentionCurfewEligibilityDate?: string
  indeterminateSentence?: boolean
  paroleEligibilityDate?: string
  sentenceExpiryDate?: string
  sentenceStartDate?: string
  tariffDate?: string
}
