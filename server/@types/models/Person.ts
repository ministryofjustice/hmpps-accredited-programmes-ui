interface Person {
  dateOfBirth: string
  name: string
  prisonNumber: string
  setting: 'Custody'
  bookingId?: string
  conditionalReleaseDate?: string
  currentPrison?: string
  ethnicity?: string
  gender?: string
  homeDetentionCurfewEligibilityDate?: string
  indeterminateSentence?: boolean
  paroleEligibilityDate?: string
  religionOrBelief?: string
  sentenceExpiryDate?: string
  sentenceStartDate?: string
  tariffDate?: string
}

interface KeyDates {
  code: string
  type: string
  date?: string
  description?: string
  earliestReleaseDate?: boolean
  order?: number
}
interface Sentence {
  description?: string
  sentenceStartDate?: string
}
interface SentenceDetails {
  keyDates?: Array<KeyDates>
  sentences?: Array<Sentence>
}

export type { KeyDates, Person, SentenceDetails }
