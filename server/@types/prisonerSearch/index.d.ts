import type { components } from './imported'

type Prisoner = Omit<
  components['schemas']['Prisoner'],
  'maritalStatus' | 'mostSeriousOffence' | 'nationality' | 'restrictedPatient' | 'status' | 'youthOffender'
>

type PrisonerWithBookingId = Prisoner & { bookingId: string }

export type { Prisoner, PrisonerWithBookingId }
