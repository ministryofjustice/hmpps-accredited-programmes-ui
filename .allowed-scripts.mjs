import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
   allowlist: {
      'node_modules/@scarf/scarf@1.4.0': 'FORBID',
      'node_modules/cypress@16.2.0': 'ALLOW',
      'node_modules/djlint@1.36.4': 'ALLOW',
      'node_modules/dtrace-provider@0.8.8': 'ALLOW',
      'node_modules/fsevents@2.3.3': 'ALLOW',
      'node_modules/unrs-resolver@1.12.2': 'ALLOW',
   },
})
