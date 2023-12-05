import { audience, course, courseAudience, offering, prerequisite, referral } from './tableDefinitions'
import tableSql from './tableSql'

const insertSql = [course, prerequisite, audience, courseAudience, offering, referral]
  .map(tableDefinition => tableSql(tableDefinition))
  .join('\n\n')

const sql = `-- Changes to this script should ideally be made by updating and rerunning the UI script documented at
-- https://github.com/ministryofjustice/hmpps-accredited-programmes-ui/blob/main/README.md#seeded-resources

DELETE from referral;
DELETE from offering;
DELETE from course_audience;
DELETE from audience;
DELETE from prerequisite;
DELETE from course;

${insertSql}
`

// eslint-disable-next-line no-console
console.log(sql)
