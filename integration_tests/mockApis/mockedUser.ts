import { userFactory } from '../../server/testutils/factories'

const mockedUser = userFactory.build({ name: 'john smith', username: 'USER1' })

export default mockedUser
