import { path } from 'static-path'

const searchByCriteriaPath = path('/prisoner-search/match-prisoners')
const searchByPrisonNumbersPath = path('/prisoner-search/prisoner-numbers')

export default {
  prisoner: {
    searchByCriteria: searchByCriteriaPath,
    searchByPrisonNumbers: searchByPrisonNumbersPath,
  },
}
