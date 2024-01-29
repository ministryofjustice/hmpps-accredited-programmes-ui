import TableDefinitions from './tableDefinitions'
import tableSql from './tableSql'

const insertSql = [
  TableDefinitions.course(),
  TableDefinitions.prerequisite(),
  TableDefinitions.offering(),
  TableDefinitions.referrerUser(),
  TableDefinitions.referral(),
]
  .map(tableDefinition => tableSql(tableDefinition))
  .join('\n\n')

const sql = `-- Changes to this script should ideally be made by updating and rerunning the UI script documented at
-- https://github.com/ministryofjustice/hmpps-accredited-programmes-ui/blob/main/README.md#seeded-resources

DELETE from referral;
DELETE from referrer_user;
DELETE from offering;
DELETE from prerequisite;
DELETE from course;

${insertSql}
`

// eslint-disable-next-line no-console
console.log(sql)
