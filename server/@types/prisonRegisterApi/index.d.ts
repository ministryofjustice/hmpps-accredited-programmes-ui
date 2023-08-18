import type { NonEmptyArray } from '..'

type PrisonType = {
  code: string
  description: string
}

type PrisonAddress = {
  id: number // eslint-disable-next-line @typescript-eslint/member-ordering
  addressLine1: string | null
  addressLine2: string | null
  country: string
  county: string | null
  postcode: string
  town: string
}

type PrisonOperator = {
  name: string
}

type Prison = {
  active: boolean
  addresses: NonEmptyArray<PrisonAddress>
  categories: Array<string>
  contracted: boolean
  female: boolean
  male: boolean
  operators: NonEmptyArray<PrisonOperator>
  prisonId: string
  prisonName: string
  types: NonEmptyArray<PrisonType>
}

export type { Prison, PrisonAddress }
