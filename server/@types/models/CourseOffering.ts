export type CourseOffering = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  contactEmail: string
  organisationId: string
  referable: boolean
  secondaryContactEmail?: string
  withdrawn?: boolean
}
