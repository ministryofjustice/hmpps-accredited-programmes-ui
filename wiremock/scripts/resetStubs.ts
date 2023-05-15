/* eslint-disable no-console */
import { resetStubs } from '../index'

process.stdout.write('Resetting stubs... ')

resetStubs().then(_response => {
  process.stdout.write('done!\n')
})
