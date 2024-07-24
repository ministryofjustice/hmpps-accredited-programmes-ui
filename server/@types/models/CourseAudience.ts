type Audience = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  colour: string
  name: CourseAudience
}

type CourseAudience =
  | 'All offences'
  | 'Extremism offence'
  | 'Gang offence'
  | 'General offence'
  | 'General violence offence'
  | 'Intimate partner violence offence'
  | 'Sexual offence'

export type { Audience, CourseAudience }
