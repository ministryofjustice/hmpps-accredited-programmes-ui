import type { NonEmptyArray } from '..'

type PrisonType = {
  code: string
  description: string
}

type PrisonAddress = {
  id: number
  addressLine1: string | null
  addressLine2: string | null
  town: string
  county: string | null
  postcode: string
  country: string
}

type PrisonOperator = {
  name: string
}

type Prison = {
  prisonId: string
  prisonName: string
  categories: string[]
  active: boolean
  male: boolean
  female: boolean
  contracted: boolean
  types: NonEmptyArray<PrisonType>
  addresses: NonEmptyArray<PrisonAddress>
  operators: NonEmptyArray<PrisonOperator>
}

export type { Prison, PrisonAddress }
