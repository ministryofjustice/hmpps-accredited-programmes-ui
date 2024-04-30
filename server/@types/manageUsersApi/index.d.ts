interface User {
  active: boolean
  authSource: string
  name: string
  userId: string
  username: string
  activeCaseLoadId?: string
  caseloadDescription?: string
  staffId?: number
  uuid?: string
}

interface UserEmail {
  email: string
  username: string
  verified: boolean
}

export type { User, UserEmail }
