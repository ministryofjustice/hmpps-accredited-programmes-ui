type Caseload = {
  caseLoadId: string // eslint-disable-next-line @typescript-eslint/member-ordering
  caseloadFunction: string
  currentlyActive: boolean
  description: string
  type: string
}

type SentenceAndOffenceDetails = {
  sentenceStartDate: string
  sentenceTypeDescription: string
}

export type { Caseload, SentenceAndOffenceDetails }
