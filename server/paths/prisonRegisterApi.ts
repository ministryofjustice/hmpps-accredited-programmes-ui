import { path } from 'static-path'

const prisonsBasePath = path('/prisons')
const prisonPath = prisonsBasePath.path('id/:prisonId')

export default {
  prisons: {
    all: prisonsBasePath,
    show: prisonPath,
  },
}
