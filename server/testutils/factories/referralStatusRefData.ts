import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { statusDescriptionAndColour } from './referral'
import { referralStatuses } from '../../@types/models/Referral'
import type { ReferralStatus, ReferralStatusRefData } from '@accredited-programmes/models'
import type { TagColour } from '@accredited-programmes/ui'

export default Factory.define<ReferralStatusRefData>(({ params }) => {
  const { hasConfirmation: hasConfirmationParam, hasNotes: hasNotesParam } = params

  const code = faker.helpers.arrayElement(referralStatuses).toUpperCase() as ReferralStatus
  const { statusColour, statusDescription } = statusDescriptionAndColour(code)
  const colour = statusColour as TagColour
  const description = statusDescription as string

  const hasConfirmation = hasNotesParam ? false : hasConfirmationParam || faker.datatype.boolean()
  const confirmationText = hasConfirmation ? faker.lorem.sentence() : undefined
  const hasNotes = !hasConfirmation

  return {
    closed: faker.datatype.boolean(),
    code,
    colour,
    confirmationText,
    description,
    draft: faker.datatype.boolean(),
    hasConfirmation,
    hasNotes,
  }
})
