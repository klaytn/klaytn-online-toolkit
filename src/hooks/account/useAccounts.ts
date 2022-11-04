import Caver, { AccountKeyForRPC, Keyring } from 'caver-js'
import { useQuery } from 'react-query'

type AccountInfoType = {
  address: string
  accountKey: AccountKeyForRPC
  klay_balance: string
}

export type UseAccountsReturn = {
  generateKey: (setter: (value: string) => void) => void
  accountInfo?: AccountInfoType
  refetchAccountInfo: () => void
}

const useAccounts = ({
  caver,
  keyring,
}: {
  caver: Caver
  keyring?: Keyring
}): UseAccountsReturn => {
  const generateKey = (setter: (value: string) => void): void => {
    const key = caver.wallet.keyring.generateSingleKey()
    setter(key)
  }

  const { data: accountInfo, refetch: refetchAccountInfo } = useQuery(
    [keyring],
    async () => {
      if (keyring) {
        const accountKey = await caver.rpc.klay.getAccountKey(keyring.address)

        if (accountKey) {
          const hexBalance = await caver.rpc.klay.getBalance(keyring.address)
          return {
            address: keyring.address,
            accountKey,
            klay_balance: caver.utils.fromPeb(hexBalance, 'KLAY'),
          }
        }
      }
    },
    {
      enabled: !!keyring,
    }
  )

  return { generateKey, accountInfo, refetchAccountInfo }
}

export default useAccounts
