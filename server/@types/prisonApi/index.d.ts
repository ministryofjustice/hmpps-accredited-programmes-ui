type Caseload = {
  caseLoadId: string // eslint-disable-next-line @typescript-eslint/member-ordering
  caseloadFunction: string
  currentlyActive: boolean
  description: string
  type: string
}

type SentenceAndOffenceDetails = {
  sentenceDate: string
  sentenceTypeDescription: string
}

export type { Caseload, SentenceAndOffenceDetails }
