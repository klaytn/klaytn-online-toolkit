import { ReactElement } from 'react'

import Text from './Text'

const PrivateKeyWarning = (): ReactElement => (
  <Text style={{ color: 'red', fontWeight: 600, fontSize: 18 }}>
    Test purpose only! Never use your "real" private key.
  </Text>
)

export default PrivateKeyWarning
